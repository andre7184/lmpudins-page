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
  if(!galleryImages.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhuma imagem cadastrada.';list.appendChild(empty);return}
  galleryImages.forEach((item,index)=>{
    const row=document.createElement('div');row.className='gallery-item';
    const img=document.createElement('img');img.src=item.url||item.src||item.image||item.path;img.alt=item.description||'Imagem do produto';
    const details=document.createElement('div');details.className='gallery-item-details';
    const desc=document.createElement('input');desc.type='text';desc.placeholder='Descrição da imagem';desc.value=item.description||'';desc.setAttribute('aria-label','Descrição da imagem '+(index+1));desc.addEventListener('input',()=>{galleryImages[index].description=desc.value});
    const path=document.createElement('small');path.textContent=item.url||item.src||item.image||item.path;
    details.append(desc,path);
    const remove=document.createElement('button');remove.type='button';remove.className='btn danger';remove.textContent='Remover';remove.addEventListener('click',()=>{galleryImages.splice(index,1);renderGallery()});
    if(index===0){const main=document.createElement('small');main.className='main-image-label';main.textContent='IMAGEM PRINCIPAL';details.prepend(main)}row.append(img,details,remove);list.appendChild(row);
  });
}
function clearForm(){
  selectedId=null;galleryImages=[];$('product-form').reset();$('product-id').value='';$('sort-order').value='0';$('active').checked=true;$('nutrition').value='{}';$('delete-product').classList.add('hidden');status('form-status','');status('gallery-upload-status','');renderGallery();renderList();openModal('Novo produto');
}
function fillForm(p){
  selectedId=p.id;galleryImages=Array.isArray(p.images)?p.images.map(x=>({...x})):[];if(p.image&&!galleryImages.some(x=>(x.url||x.src||x.image||x.path)===p.image))galleryImages.unshift({url:p.image,description:p.image_description||''});else if(p.image){const i=galleryImages.findIndex(x=>(x.url||x.src||x.image||x.path)===p.image);if(i>0)galleryImages.unshift(galleryImages.splice(i,1)[0]);} $('product-id').value=p.id;$('slug').value=p.slug;$('name').value=p.name;$('category').value=p.category||'Cremosos';$('sort-order').value=p.sort_order||0;$('short-description').value=p.short_description||'';$('description').value=p.description||'';$('ingredients').value=p.ingredients||'';$('image').value=p.image||'';$('nutrition').value=JSON.stringify(p.nutrition||{},null,2);$('active').checked=!!p.active;$('delete-product').classList.remove('hidden');$('gallery-file').value='';$('gallery-description').value='';status('form-status','');status('gallery-upload-status','');renderGallery();renderList();openModal('Editar produto');
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
async function checkSession(){try{await api('/api/auth/me');showDashboard(true);await loadProducts();await loadLibrary()}catch(err){showDashboard(false);status('login-status',err.message)}}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();status('login-status','Entrando…');try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:$('username').value,password:$('password').value})});$('password').value='';showDashboard(true);await loadProducts();status('login-status','')}catch(err){status('login-status',err.message)}});
$('logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}finally{showDashboard(false)}});
$('new-product').addEventListener('click',clearForm);$('close-modal').addEventListener('click',closeModal);$('product-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-modal]'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('product-modal').classList.contains('hidden'))closeModal()});
$('product-form').addEventListener('submit',async e=>{
  e.preventDefault();status('form-status','Salvando…');let nutrition;
  try{nutrition=JSON.parse($('nutrition').value||'{}');if(!nutrition||Array.isArray(nutrition)||typeof nutrition!=='object')throw new Error()}catch{status('form-status','A informação nutricional precisa ser um objeto JSON válido.');return}
  const p={slug:$('slug').value.trim(),name:$('name').value.trim(),category:$('category').value,sort_order:Number($('sort-order').value)||0,short_description:$('short-description').value,description:$('description').value,ingredients:$('ingredients').value,image:(galleryImages[0]?.url||galleryImages[0]?.src||galleryImages[0]?.image||galleryImages[0]?.path||''),image_description:galleryImages[0]?.description||'',images:galleryImages,nutrition,active:$('active').checked};
  try{if(selectedId)await api('/api/admin/products/'+selectedId,{method:'PUT',body:JSON.stringify(p)});else await api('/api/admin/products',{method:'POST',body:JSON.stringify(p)});await loadProducts();closeModal();status('products-status','Produto salvo com sucesso.')}catch(err){status('form-status',err.message)}
});
$('delete-product').addEventListener('click',async()=>{if(!selectedId||!confirm('Excluir este produto do catálogo?'))return;try{await api('/api/admin/products/'+selectedId,{method:'DELETE'});await loadProducts();closeModal();status('products-status','Produto excluído.')}catch(err){status('form-status',err.message)}});
async function uploadImage({asGallery}){
  const file=$('gallery-file').files?.[0];if(!file){status('gallery-upload-status','Selecione uma imagem antes de enviar.');return}
  const body=new FormData();body.append('image',file);status('gallery-upload-status','Enviando imagem…');
  try{const response=await fetch('/api/admin/uploads',{method:'POST',credentials:'same-origin',body});const data=await response.json().catch(()=>({error:'Resposta inválida do servidor.'}));if(!response.ok)throw new Error(data.error||'Falha no envio.');
    galleryImages.push({url:data.url,description:$('gallery-description').value.trim()});if(galleryImages.length===1)$('image').value=data.url;renderGallery();$('gallery-description').value='';$('gallery-file').value='';status('gallery-upload-status','Imagem adicionada à lista. A primeira imagem é a principal. Clique em “Salvar produto” para gravar o cadastro.')
  }catch(err){status('gallery-upload-status',err.message)}
}
$('upload-gallery-image').addEventListener('click',()=>uploadImage({asGallery:true}));
checkSession();

async function loadLibrary(){const items=await api('/api/admin/gallery');const list=$('library-list');list.replaceChildren();if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Nenhuma imagem independente cadastrada.';list.append(p);return}items.forEach(item=>{const row=document.createElement('div');row.className='gallery-item';const img=document.createElement('img');img.src=item.url;img.alt=item.description||item.category;const info=document.createElement('div');info.className='gallery-item-details';const desc=document.createElement('strong');desc.textContent=item.description||'Sem descrição';const cat=document.createElement('small');cat.textContent=item.category;info.append(desc,cat);const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Remover';del.addEventListener('click',async()=>{if(!confirm('Remover esta imagem da biblioteca?'))return;try{await api('/api/admin/gallery/'+item.id,{method:'DELETE'});await loadLibrary()}catch(e){status('library-status',e.message)}});row.append(img,info,del);list.append(row)})}
$('library-upload').addEventListener('click',async()=>{const file=$('library-file').files?.[0];if(!file){status('library-status','Selecione uma imagem.');return}status('library-status','Enviando imagem…');try{const body=new FormData();body.append('image',file);const response=await fetch('/api/admin/uploads',{method:'POST',credentials:'same-origin',body});const data=await response.json();if(!response.ok)throw new Error(data.error||'Falha no envio.');await api('/api/admin/gallery',{method:'POST',body:JSON.stringify({url:data.url,description:$('library-description').value.trim(),category:$('library-category').value})});$('library-file').value='';$('library-description').value='';await loadLibrary();status('library-status','Imagem cadastrada na biblioteca.')}catch(e){status('library-status',e.message)}});
const originalCheckSession=checkSession;
