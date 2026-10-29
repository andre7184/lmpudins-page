const $ = id => document.getElementById(id);
let products = [], selectedId = null, galleryImages = [];
async function api(path, options={}) {
  const response = await fetch(path,{cache:'no-store',credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  if(response.status===204) return null;
  const data = await response.json().catch(()=>({error:'Resposta inválida do servidor.'}));
  if(!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}
function status(id,message){$(id).textContent=message||''}
function showDashboard(show){$('login').classList.toggle('hidden',show);$('dashboard').classList.toggle('hidden',!show)}
function openModal(title){$('modal-title').textContent=title;$('product-modal').classList.remove('hidden');document.body.style.overflow='hidden'}
function closeModal(){$('product-modal').classList.add('hidden');document.body.style.overflow=''}
function renderGallery(){
  const list=$('gallery-list');list.replaceChildren();
  if(!galleryImages.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhuma imagem adicional cadastrada.';list.appendChild(empty);return}
  galleryImages.forEach((item,index)=>{
    const row=document.createElement('div');row.className='gallery-item';
    const img=document.createElement('img');img.src=item.url||item.src||item.image||item.path;img.alt=item.description||'Imagem do produto';
    const details=document.createElement('div');details.className='gallery-item-details';
    const desc=document.createElement('input');desc.type='text';desc.placeholder='Descrição da imagem';desc.value=item.description||'';desc.setAttribute('aria-label','Descrição da imagem '+(index+1));desc.addEventListener('input',()=>{galleryImages[index].description=desc.value});
    const path=document.createElement('small');path.textContent=item.url||item.src||item.image||item.path;
    details.append(desc,path);
    const remove=document.createElement('button');remove.type='button';remove.className='btn danger';remove.textContent='Remover';remove.addEventListener('click',()=>{galleryImages.splice(index,1);renderGallery()});
    row.append(img,details,remove);list.appendChild(row);
  });
}
function clearForm(){
  selectedId=null;galleryImages=[];$('product-form').reset();$('product-id').value='';$('sort-order').value='0';$('active').checked=true;$('nutrition').value='{}';$('delete-product').classList.add('hidden');status('form-status','');status('gallery-upload-status','');renderGallery();renderList();openModal('Novo produto');
}
function fillForm(p){
  selectedId=p.id;galleryImages=Array.isArray(p.images)?p.images.map(x=>({...x})):[];$('product-id').value=p.id;$('slug').value=p.slug;$('name').value=p.name;$('category').value=p.category||'Cremosos';$('sort-order').value=p.sort_order||0;$('short-description').value=p.short_description||'';$('description').value=p.description||'';$('ingredients').value=p.ingredients||'';$('image').value=p.image||'';$('nutrition').value=JSON.stringify(p.nutrition||{},null,2);$('active').checked=!!p.active;$('delete-product').classList.remove('hidden');$('image-file').value='';$('gallery-description').value='';status('form-status','');status('gallery-upload-status','');renderGallery();renderList();openModal('Editar produto');
}
function renderList(){
  const list=$('product-list');list.replaceChildren();
  if(!products.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhum produto cadastrado.';list.appendChild(empty);return}
  products.forEach(p=>{const card=document.createElement('article');card.className='product-card';const img=document.createElement('img');img.src=p.image||'/images/Logo%20circular.png';img.alt=p.name;img.loading='lazy';const body=document.createElement('div');body.className='product-card-body';const name=document.createElement('strong');name.textContent=p.name;const meta=document.createElement('small');meta.textContent=(p.category||'Sem categoria')+' · '+(p.active?'Publicado':'Rascunho');const actions=document.createElement('div');actions.className='product-card-actions';const count=document.createElement('small');count.textContent=((Array.isArray(p.images)?p.images.length:0)+(p.image?1:0))+' imagem(ns)';const edit=document.createElement('button');edit.type='button';edit.className='btn primary';edit.textContent='Editar';edit.addEventListener('click',()=>fillForm(p));actions.append(count,edit);body.append(name,meta,actions);card.append(img,body);list.appendChild(card)});
}
async function loadProducts(){
  status('products-status','Carregando produtos do banco…');
  try{const data=await api('/api/admin/products');if(!Array.isArray(data))throw new Error('A API administrativa não retornou uma lista de produtos.');products=data;renderList();status('products-status',products.length?products.length+' produto(s) carregado(s).':'O banco respondeu corretamente, mas não há produtos cadastrados.')}
  catch(err){products=[];renderList();status('products-status','Falha ao carregar produtos: '+err.message);throw err}
}
async function checkSession(){try{await api('/api/auth/me');showDashboard(true);await loadProducts()}catch(err){showDashboard(false);status('login-status',err.message)}}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();status('login-status','Entrando…');try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:$('username').value,password:$('password').value})});$('password').value='';showDashboard(true);await loadProducts();status('login-status','')}catch(err){status('login-status',err.message)}});
$('logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}finally{showDashboard(false)}});
$('new-product').addEventListener('click',clearForm);$('close-modal').addEventListener('click',closeModal);$('product-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-modal]'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('product-modal').classList.contains('hidden'))closeModal()});
$('product-form').addEventListener('submit',async e=>{
  e.preventDefault();status('form-status','Salvando…');let nutrition;
  try{nutrition=JSON.parse($('nutrition').value||'{}');if(!nutrition||Array.isArray(nutrition)||typeof nutrition!=='object')throw new Error()}catch{status('form-status','A informação nutricional precisa ser um objeto JSON válido.');return}
  const p={slug:$('slug').value.trim(),name:$('name').value.trim(),category:$('category').value,sort_order:Number($('sort-order').value)||0,short_description:$('short-description').value,description:$('description').value,ingredients:$('ingredients').value,image:$('image').value.trim(),images:galleryImages,nutrition,active:$('active').checked};
  try{if(selectedId)await api('/api/admin/products/'+selectedId,{method:'PUT',body:JSON.stringify(p)});else await api('/api/admin/products',{method:'POST',body:JSON.stringify(p)});await loadProducts();closeModal();status('products-status','Produto salvo com sucesso.')}catch(err){status('form-status',err.message)}
});
$('delete-product').addEventListener('click',async()=>{if(!selectedId||!confirm('Excluir este produto do catálogo?'))return;try{await api('/api/admin/products/'+selectedId,{method:'DELETE'});await loadProducts();closeModal();status('products-status','Produto excluído.')}catch(err){status('form-status',err.message)}});
async function uploadImage({asGallery}){
  const file=$('image-file').files?.[0];if(!file){status('gallery-upload-status','Selecione uma imagem antes de enviar.');return}
  const body=new FormData();body.append('image',file);status('gallery-upload-status','Enviando imagem…');
  try{const response=await fetch('/api/admin/uploads',{method:'POST',credentials:'same-origin',body});const data=await response.json().catch(()=>({error:'Resposta inválida do servidor.'}));if(!response.ok)throw new Error(data.error||'Falha no envio.');
    if(asGallery){galleryImages.push({url:data.url,description:$('gallery-description').value.trim()});renderGallery();$('gallery-description').value='';$('image-file').value='';status('gallery-upload-status','Imagem adicionada à lista. Clique em “Salvar produto” para gravar no cadastro.')}
    else{$('image').value=data.url;status('upload-status','Imagem principal enviada. Salve o produto para gravar o caminho.')}
  }catch(err){status('gallery-upload-status',err.message)}
}
$('upload-image').addEventListener('click',()=>uploadImage({asGallery:false}));
$('upload-gallery-image').addEventListener('click',()=>uploadImage({asGallery:true}));
checkSession();
