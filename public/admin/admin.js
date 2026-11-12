const $ = id => document.getElementById(id);
let products = [], selectedId = null, galleryImages = [], versions = [], selectedVersionId = null, versionGalleryImages = [];
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
function updateVersionImageOptions(){
  const presentationSelect=$('version-presentation'), sizeSelect=$('version-size');
  if(!presentationSelect||!sizeSelect)return;
  let presentations=[];
  try{const parsed=JSON.parse($('presentations').value||'[]');if(Array.isArray(parsed))presentations=parsed}catch{}
  const previous=presentationSelect.value;
  presentationSelect.replaceChildren(new Option('Selecione a apresentação',''));
  presentations.forEach((presentation,index)=>presentationSelect.add(new Option(presentation.name||('Apresentação '+(index+1)),presentation.key||presentation.name||String(index))));
  if([...presentationSelect.options].some(option=>option.value===previous))presentationSelect.value=previous;
  const selected=presentationSelect.value;
  const presentation=presentations.find((item,index)=>(item.key||item.name||String(index))===selected);
  const previousSize=sizeSelect.value;
  sizeSelect.replaceChildren(new Option('Toda a apresentação',''));
  (presentation?.sizes||[]).forEach(size=>sizeSelect.add(new Option(size.name,size.name)));
  if([...sizeSelect.options].some(option=>option.value===previousSize))sizeSelect.value=previousSize;
}
function renderGallery(){
  const list=$('gallery-list');list.replaceChildren();
  if(!galleryImages.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhuma imagem cadastrada.';list.appendChild(empty);return}
  galleryImages.forEach((item,index)=>{
    const row=document.createElement('div');row.className='gallery-item';
    const img=document.createElement('img');img.src=item.url||item.src||item.image||item.path;img.alt=item.description||'Imagem do produto';
    const details=document.createElement('div');details.className='gallery-item-details';
    const desc=document.createElement('input');desc.type='text';desc.placeholder='Descrição da imagem';desc.value=item.description||'';desc.setAttribute('aria-label','Descrição da imagem '+(index+1));desc.addEventListener('input',()=>{galleryImages[index].description=desc.value});
    const destination=document.createElement('small');destination.className='gallery-item-destination';
    destination.textContent=item.destination==='versao'?'VERSÃO · '+(item.presentationName||'Apresentação')+(item.sizeName?' · '+item.sizeName:''):'SABOR · IMAGEM GERAL';
    const path=document.createElement('small');path.textContent=item.url||item.src||item.image||item.path;
    details.append(desc,destination,path);
    const remove=document.createElement('button');remove.type='button';remove.className='btn danger';remove.textContent='Remover';remove.addEventListener('click',()=>{galleryImages.splice(index,1);renderGallery()});
    if(item.destination!=='versao'&&galleryImages.findIndex(image=>image.destination!=='versao')===index){const main=document.createElement('small');main.className='main-image-label';main.textContent='IMAGEM PRINCIPAL';details.prepend(main)}row.append(img,details,remove);list.appendChild(row);
  });
}
function clearForm(){
  selectedId=null;galleryImages=[];$('product-form').reset();$('product-id').value='';$('sort-order').value='0';$('active').checked=true;$('nutrition').value='{}';$('components').value='{}';$('presentations').value='[]';$('gallery-destination').value='sabor';$('version-image-fields').style.display='none';updateVersionImageOptions();$('delete-product').classList.add('hidden');status('form-status','');status('gallery-upload-status','');$('product-qrcode-panel').classList.add('hidden');renderGallery();renderList();openModal('Novo produto');
}
function fillForm(p){
  selectedId=p.id;galleryImages=Array.isArray(p.images)?p.images.map(x=>({...x})):[];if(p.image&&!galleryImages.some(x=>(x.url||x.src||x.image||x.path)===p.image))galleryImages.unshift({url:p.image,description:p.image_description||''});else if(p.image){const i=galleryImages.findIndex(x=>(x.url||x.src||x.image||x.path)===p.image);if(i>0)galleryImages.unshift(galleryImages.splice(i,1)[0]);} $('product-id').value=p.id;$('slug').value=p.slug;$('name').value=p.name;$('category').value=p.category||'Cremosos';$('sort-order').value=p.sort_order||0;$('short-description').value=p.short_description||'';$('description').value=p.description||'';$('ingredients').value=p.ingredients||'';$('image').value=p.image||'';$('nutrition').value=JSON.stringify(p.nutrition||{},null,2);$('components').value=JSON.stringify(p.components||{},null,2);$('presentations').value=JSON.stringify(p.presentations||[],null,2);$('active').checked=!!p.active;$('gallery-destination').value='sabor';$('version-image-fields').style.display='none';updateVersionImageOptions();$('delete-product').classList.remove('hidden');$('gallery-file').value='';$('gallery-description').value='';status('form-status','');status('gallery-upload-status','');$('product-qrcode-panel').classList.remove('hidden');renderProductQr();renderGallery();renderList();openModal('Editar produto');
}

function productPageUrl(){
  const slug=$('slug').value.trim();
  return slug ? new URL('/produto/'+encodeURIComponent(slug),window.location.origin).href : '';
}
function renderProductQr(){
  const url=productPageUrl(), target=$('product-qrcode');
  $('product-page-url').textContent=url||'Informe o identificador do produto para gerar o QR Code.';
  const integrationId=products.find(p=>String(p.id)===String(selectedId))?.integration_id||'';
  $('product-integration-id').textContent=integrationId||'Salve o produto para gerar o ID permanente.';
  $('copy-product-integration-id').disabled=!integrationId;
  target.replaceChildren();
  $('download-product-qr').disabled=!url;
  $('copy-product-url').disabled=!url;
  if(!url || !window.QRCode)return;
  new QRCode(target,{text:url,width:190,height:190,colorDark:'#241319',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
}
$('slug').addEventListener('input',()=>{if(!$('product-qrcode-panel').classList.contains('hidden'))renderProductQr()});
$('copy-product-integration-id').addEventListener('click',async()=>{const id=$('product-integration-id').textContent;if(!id||id.startsWith('Salve'))return;try{await navigator.clipboard.writeText(id);status('product-qr-status','ID de integração copiado.')}catch{status('product-qr-status','Não foi possível copiar automaticamente. Selecione o ID acima.')}});
$('copy-product-url').addEventListener('click',async()=>{
  const url=productPageUrl();if(!url)return;
  try{await navigator.clipboard.writeText(url);status('product-qr-status','Link copiado.')}catch{status('product-qr-status','Não foi possível copiar automaticamente. Selecione e copie o link acima.')}
});
$('download-product-qr').addEventListener('click',()=>{
  const canvas=$('product-qrcode').querySelector('canvas');
  const image=$('product-qrcode').querySelector('img');
  const data=canvas?.toDataURL('image/png')||image?.src;
  if(!data)return;
  const link=document.createElement('a');link.href=data;link.download='qrcode-'+($('slug').value.trim()||'produto')+'.png';link.click();
});

function renderList(){
  const list=$('product-list');list.replaceChildren();
  if(!products.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhum produto cadastrado.';list.appendChild(empty);return}
  products.forEach(p=>{const card=document.createElement('article');card.className='product-card';const img=document.createElement('img');img.src=p.image||'/images/Logo%20circular.png';img.alt=p.name;img.loading='lazy';const body=document.createElement('div');body.className='product-card-body';const name=document.createElement('strong');name.textContent=p.name;const meta=document.createElement('small');meta.textContent=(p.category||'Sem categoria')+' · '+(p.active?'Publicado':'Rascunho');const actions=document.createElement('div');actions.className='product-card-actions';const count=document.createElement('small');count.textContent=((Array.isArray(p.images)?p.images.length:0)+(p.image?1:0))+' imagem(ns)';const edit=document.createElement('button');edit.type='button';edit.className='btn primary';edit.textContent='Editar';edit.addEventListener('click',()=>fillForm(p));const label=document.createElement('button');label.type='button';label.className='btn';label.textContent='Etiqueta';label.addEventListener('click',()=>openLabel(p));actions.append(count,edit,label);body.append(name,meta,actions);card.append(img,body);list.appendChild(card)});
}
async function loadProducts(){
  status('products-status','Carregando produtos do banco…');
  try{const data=await api('/api/admin/products');if(!Array.isArray(data))throw new Error('A API administrativa não retornou uma lista de produtos.');products=data;renderList();status('products-status',products.length?products.length+' produto(s) carregado(s).':'O banco respondeu corretamente, mas não há produtos cadastrados.')}
  catch(err){products=[];renderList();status('products-status','Falha ao carregar produtos: '+err.message);throw err}
}
async function checkSession(){try{await api('/api/auth/me');showDashboard(true);await loadProducts();await loadLibrary();await loadVersions()}catch(err){showDashboard(false);status('login-status',err.message)}}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();status('login-status','Entrando…');try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:$('username').value,password:$('password').value})});$('password').value='';showDashboard(true);await loadProducts();await loadLibrary();await loadVersions();status('login-status','')}catch(err){status('login-status',err.message)}});
$('logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}finally{showDashboard(false)}});
$('new-product').addEventListener('click',clearForm);$('close-modal').addEventListener('click',closeModal);$('product-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-modal]'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('product-modal').classList.contains('hidden'))closeModal()});
$('product-form').addEventListener('submit',async e=>{
  e.preventDefault();status('form-status','Salvando…');let nutrition,components,presentations;
  try{nutrition=JSON.parse($('nutrition').value||'{}');if(!nutrition||Array.isArray(nutrition)||typeof nutrition!=='object')throw new Error()}catch{status('form-status','A informação nutricional precisa ser um objeto JSON válido.');return}
  try{components=JSON.parse($('components').value||'{}');if(!components||Array.isArray(components)||typeof components!=='object')throw new Error()}catch{status('form-status','A composição por componente precisa ser um objeto JSON válido.');return}
  try{presentations=JSON.parse($('presentations').value||'[]');if(!Array.isArray(presentations))throw new Error()}catch{status('form-status','Apresentações e tamanhos precisam ser uma lista JSON válida.');return}
  const mainImage=galleryImages.find(item=>item.destination!=='versao')||galleryImages[0];
  const p={slug:$('slug').value.trim(),name:$('name').value.trim(),category:$('category').value,sort_order:Number($('sort-order').value)||0,short_description:$('short-description').value,description:$('description').value,ingredients:$('ingredients').value,image:(mainImage?.url||mainImage?.src||mainImage?.image||mainImage?.path||$('image').value||''),image_description:mainImage?.description||'',images:galleryImages,nutrition,components,presentations,active:$('active').checked};
  try{if(selectedId)await api('/api/admin/products/'+selectedId,{method:'PUT',body:JSON.stringify(p)});else await api('/api/admin/products',{method:'POST',body:JSON.stringify(p)});await loadProducts();closeModal();status('products-status','Produto salvo com sucesso.')}catch(err){status('form-status',err.message)}
});
$('delete-product').addEventListener('click',async()=>{if(!selectedId||!confirm('Excluir este produto do catálogo?'))return;try{await api('/api/admin/products/'+selectedId,{method:'DELETE'});await loadProducts();closeModal();status('products-status','Produto excluído.')}catch(err){status('form-status',err.message)}});
async function uploadImage(){
  const file=$('gallery-file').files?.[0];if(!file){status('gallery-upload-status','Selecione uma imagem antes de enviar.');return}
  const destination=$('gallery-destination').value;
  let presentation=null;
  if(destination==='versao'){
    try{const list=JSON.parse($('presentations').value||'[]');presentation=list.find((item,index)=>(item.key||item.name||String(index))===$('version-presentation').value)||null}
    catch{status('gallery-upload-status','Corrija o JSON de apresentações antes de associar uma imagem a uma versão.');return}
    if(!presentation){status('gallery-upload-status','Selecione uma apresentação antes de enviar a imagem.');return}
  }
  const body=new FormData();body.append('image',file);status('gallery-upload-status','Enviando imagem…');
  try{
    const response=await fetch('/api/admin/uploads',{method:'POST',credentials:'same-origin',body});
    const data=await response.json().catch(()=>({error:'Resposta inválida do servidor.'}));
    if(!response.ok)throw new Error(data.error||'Falha no envio.');
    const description=$('gallery-description').value.trim();
    const image={url:data.url,description,destination};
    if(destination==='versao'){
      image.presentationKey=presentation.key||presentation.name;
      image.presentationName=presentation.name;
      image.sizeName=$('version-size').value||'';
    }
    galleryImages.push(image);
    if(destination==='sabor'&&!$('image').value)$('image').value=data.url;
    renderGallery();
    status('gallery-upload-status',destination==='versao'?'Imagem associada à versão. Salve o produto para gravar a alteração.':'Imagem associada ao sabor. Salve o produto para gravar a alteração.');
    $('gallery-description').value='';$('gallery-file').value='';
  }catch(err){status('gallery-upload-status',err.message)}
}
$('gallery-destination').addEventListener('change',()=>{
  const isVersion=$('gallery-destination').value==='versao';
  $('version-image-fields').style.display=isVersion?'block':'none';
  updateVersionImageOptions();
});
$('presentations').addEventListener('input',updateVersionImageOptions);
$('version-presentation').addEventListener('change',updateVersionImageOptions);
$('upload-gallery-image').addEventListener('click',uploadImage);
checkSession();

async function loadLibrary(){const items=await api('/api/admin/gallery');const list=$('library-list');list.replaceChildren();if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Nenhuma imagem institucional cadastrada.';list.append(p);return}items.forEach(item=>{const row=document.createElement('div');row.className='gallery-item';const img=document.createElement('img');img.src=item.url;img.alt=item.description||item.category;const info=document.createElement('div');info.className='gallery-item-details';const desc=document.createElement('strong');desc.textContent=item.description||'Sem descrição';const cat=document.createElement('small');cat.textContent=item.category;info.append(desc,cat);const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Remover';del.addEventListener('click',async()=>{if(!confirm('Remover esta imagem da biblioteca?'))return;try{await api('/api/admin/gallery/'+item.id,{method:'DELETE'});await loadLibrary()}catch(e){status('library-status',e.message)}});row.append(img,info,del);list.append(row)})}
$('library-upload').addEventListener('click',async()=>{const file=$('library-file').files?.[0];if(!file){status('library-status','Selecione uma imagem.');return}status('library-status','Enviando imagem…');try{const url=await uploadVersionImage(file);await api('/api/admin/gallery',{method:'POST',body:JSON.stringify({url,description:$('library-description').value.trim(),category:$('library-category').value,destination:'geral'})});$('library-file').value='';$('library-description').value='';await loadLibrary();status('library-status','Imagem cadastrada na biblioteca.')}catch(e){status('library-status',e.message)}});
async function uploadVersionImage(file){const body=new FormData();body.append('image',file);const response=await fetch('/api/admin/uploads',{method:'POST',credentials:'same-origin',body});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Falha no envio da imagem.');return data.url}
function switchAdminTab(tab){const showProducts=tab==='products';$('admin-products-view').classList.toggle('hidden',!showProducts);$('admin-versions-view').classList.toggle('hidden',showProducts);document.querySelectorAll('[data-admin-tab]').forEach(button=>button.classList.toggle('active',button.dataset.adminTab===tab));if(!showProducts)loadVersions()}
document.querySelectorAll('[data-admin-tab]').forEach(button=>button.addEventListener('click',()=>switchAdminTab(button.dataset.adminTab)));
function renderVersions(){const list=$('version-list');list.replaceChildren();if(!versions.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Nenhuma versão cadastrada. Use “Nova versão” para criar a primeira.';list.append(empty);return}versions.forEach(v=>{const card=document.createElement('article');card.className='product-card';const img=document.createElement('img');img.src=v.image||v.detail_image||'/images/Logo circular.png';img.alt=v.name;img.loading='lazy';const body=document.createElement('div');body.className='product-card-body';const name=document.createElement('strong');name.textContent=v.name;const meta=document.createElement('small');meta.textContent=(v.active?'Publicada':'Rascunho')+' · '+(Array.isArray(v.sizes)?v.sizes.length:0)+' tamanho(s)';const desc=document.createElement('p');desc.className='muted';desc.textContent=v.short_description||v.description||'';const actions=document.createElement('div');actions.className='product-card-actions';const edit=document.createElement('button');edit.type='button';edit.className='btn primary';edit.textContent='Editar';edit.addEventListener('click',()=>editVersion(v));actions.append(edit);body.append(name,meta,desc,actions);card.append(img,body);list.append(card)})}
async function loadVersions(){status('versions-status','Carregando versões…');try{versions=await api('/api/admin/versions');renderVersions();status('versions-status',versions.length+' versão(ões) cadastrada(s).')}catch(e){status('versions-status',e.message)}}
function addVersionSize(size={}){const row=document.createElement('div');row.className='version-size-row';row.innerHTML='<div class="grid"><div class="field"><label>Nome / peso do tamanho</label><input data-size-name placeholder="Ex.: 120 g" value="'+escLabel(size.name||'')+'"></div><div class="field"><label>Descrição</label><input data-size-description placeholder="Características deste tamanho" value="'+escLabel(size.description||'')+'"></div></div><div class="field"><label>Melhor uso</label><input data-size-best-use placeholder="Ex.: Porção individual, compartilhar, presente" value="'+escLabel(size.bestUse||'')+'"></div><button type="button" class="btn danger size-remove">Remover tamanho</button>';row.querySelector('.size-remove').addEventListener('click',()=>row.remove());$('version-sizes').append(row)}
function renderVersionSizes(sizes=[]){$('version-sizes').replaceChildren();(sizes.length?sizes:[{}]).forEach(size=>addVersionSize(size))}
function showVersionPreview(id,url){const holder=$(id);holder.replaceChildren();if(url){const img=document.createElement('img');img.src=url;img.alt='Prévia da imagem';holder.append(img)}}
function resetVersionForm(){selectedVersionId=null;versionGalleryImages=[];$('version-form').reset();$('version-id').value='';$('version-sort').value='0';$('version-active').checked=true;$('version-main-image-url').value='';$('version-detail-image-url').value='';$('version-main-image').value='';$('version-detail-image').value='';$('version-gallery-files').value='';showVersionPreview('version-main-preview','');showVersionPreview('version-detail-preview','');$('version-gallery-preview').replaceChildren();renderVersionSizes([]);$('delete-version').classList.add('hidden');status('version-form-status','')}
function openVersionForm(title){$('version-modal-title').textContent=title;$('version-modal').classList.remove('hidden');document.body.style.overflow='hidden'}
function closeVersionForm(){$('version-modal').classList.add('hidden');document.body.style.overflow=''}
function editVersion(v){resetVersionForm();selectedVersionId=v.id;$('version-id').value=v.id;$('version-name').value=v.name||'';$('version-slug').value=v.slug||'';$('version-sort').value=v.sort_order||0;$('version-short-description').value=v.short_description||'';$('version-description').value=v.description||'';$('version-main-image-url').value=v.image||'';$('version-detail-image-url').value=v.detail_image||'';$('version-active').checked=!!v.active;versionGalleryImages=Array.isArray(v.gallery_images)?[...v.gallery_images]:[];showVersionPreview('version-main-preview',v.image);showVersionPreview('version-detail-preview',v.detail_image);renderVersionSizes(Array.isArray(v.sizes)?v.sizes:[]);versionGalleryImages.forEach(url=>{const img=document.createElement('img');img.src=url;$('version-gallery-preview').append(img)});$('delete-version').classList.remove('hidden');openVersionForm('Editar versão')}
$('new-version').addEventListener('click',()=>{resetVersionForm();openVersionForm('Nova versão')});
$('close-version-modal').addEventListener('click',closeVersionForm);$('version-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-version]'))closeVersionForm()});
$('add-version-size').addEventListener('click',()=>addVersionSize());
$('version-name').addEventListener('input',()=>{if(!selectedVersionId)$('version-slug').value=$('version-name').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')});
$('version-main-image').addEventListener('change',async()=>{const file=$('version-main-image').files?.[0];if(!file)return;status('version-form-status','Enviando imagem principal…');try{const url=await uploadVersionImage(file);$('version-main-image-url').value=url;showVersionPreview('version-main-preview',url);status('version-form-status','Imagem principal carregada.')}catch(e){status('version-form-status',e.message)}});
$('version-detail-image').addEventListener('change',async()=>{const file=$('version-detail-image').files?.[0];if(!file)return;status('version-form-status','Enviando imagem de detalhe…');try{const url=await uploadVersionImage(file);$('version-detail-image-url').value=url;showVersionPreview('version-detail-preview',url);status('version-form-status','Imagem de detalhe carregada.')}catch(e){status('version-form-status',e.message)}});
$('version-gallery-files').addEventListener('change',async()=>{const files=Array.from($('version-gallery-files').files||[]);if(!files.length)return;status('version-form-status','Enviando imagens da galeria…');try{for(const file of files){const url=await uploadVersionImage(file);versionGalleryImages.push(url);const img=document.createElement('img');img.src=url;$('version-gallery-preview').append(img)}status('version-form-status',files.length+' imagem(ns) adicionada(s) ao carrossel.')}catch(e){status('version-form-status',e.message)}});
$('version-form').addEventListener('submit',async e=>{e.preventDefault();const sizes=Array.from($('version-sizes').querySelectorAll('.version-size-row')).map(row=>({name:row.querySelector('[data-size-name]').value.trim(),description:row.querySelector('[data-size-description]').value.trim(),bestUse:row.querySelector('[data-size-best-use]').value.trim()})).filter(size=>size.name);if(!sizes.length){status('version-form-status','Cadastre pelo menos um tamanho disponível.');return}const data={slug:$('version-slug').value.trim(),name:$('version-name').value.trim(),short_description:$('version-short-description').value.trim(),description:$('version-description').value.trim(),image:$('version-main-image-url').value,detail_image:$('version-detail-image-url').value,gallery_images:versionGalleryImages,sizes,active:$('version-active').checked,sort_order:Number($('version-sort').value)||0};status('version-form-status','Salvando versão…');try{if(selectedVersionId)await api('/api/admin/versions/'+selectedVersionId,{method:'PUT',body:JSON.stringify(data)});else await api('/api/admin/versions',{method:'POST',body:JSON.stringify(data)});await loadVersions();closeVersionForm();status('versions-status','Versão salva com sucesso.')}catch(e){status('version-form-status',e.message)}});
$('delete-version').addEventListener('click',async()=>{if(!selectedVersionId||!confirm('Excluir esta versão?'))return;try{await api('/api/admin/versions/'+selectedVersionId,{method:'DELETE'});await loadVersions();closeVersionForm()}catch(e){status('version-form-status',e.message)}});
const originalCheckSession=checkSession;

function escLabel(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

function labelMarkup(p){
 const n=p.nutrition||{};let ns=Array.isArray(n.nutrientes)?n.nutrientes:[];
 if(typeof n.nutrientes==='string'){try{const x=JSON.parse(n.nutrientes);if(Array.isArray(x))ns=x}catch{}}
 const rows=ns.map(x=>'<tr><th>'+escLabel(x[0]||'')+'</th><td>'+escLabel(x[1]??'—')+'</td><td>'+escLabel(x[2]??'—')+'</td></tr>').join('');
 const allergy=n.alergenicos||'ALÉRGICOS: informação não cadastrada.';
 const storage=n.conservacao||'Manter refrigerado de 1 °C a 4 °C. Após aberto, consumir em até 24 horas.';
 const qrUrl=new URL('/produto/'+encodeURIComponent(p.slug||''),window.location.origin).href;
 let qrData='';
 try{const holder=document.createElement('div');new QRCode(holder,{text:qrUrl,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});const cv=holder.querySelector('canvas');const im=holder.querySelector('img');qrData=cv?cv.toDataURL('image/png'):(im?im.src:'')}catch{}
 return '<article class="print-label">'+
 '<section class="label-top"><div class="label-top-copy"><header class="label-title">'+escLabel(p.name)+'</header><div class="label-ingredients"><strong>INGREDIENTES:</strong> '+escLabel(p.ingredients||'Ingredientes não cadastrados.')+'</div>'+
 '<div class="label-allergy">'+escLabel(allergy)+'</div></div>'+
 (qrData?'<img class="label-qr" src="'+qrData+'" alt="QR Code do produto">':'<div class="label-qr-placeholder">QR indisponível</div>')+'</section>'+
 '<section class="label-bottom"><div class="label-nutrition"><div class="label-nutrition-head"><strong>INFORMAÇÃO NUTRICIONAL</strong><span>Porção: '+escLabel(n.porcao||'Porção não informada')+'</span></div>'+
 '<table class="label-table"><thead><tr><th>Quantidade por porção</th><th>Quantidade</th><th>%VD*</th></tr></thead><tbody>'+(rows||'<tr><td colspan="3">Informação nutricional não cadastrada.</td></tr>')+'</tbody></table>'+
 '<div class="label-note">'+escLabel(n.nota_vd||'* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido.')+'</div></div>'+
 '<aside class="label-side"><div class="label-stamp"><strong>DATA<br>FAB.</strong><span></span></div><div class="label-storage-vertical">'+escLabel(storage)+'</div><div class="label-validity">VALIDADE: 7 DIAS</div></aside></section></article>';
}
function openLabel(p){$('label-title').textContent='Etiqueta · '+p.name;$('label-preview').innerHTML=labelMarkup(p);$('label-modal').classList.remove('hidden');document.body.style.overflow='';$('label-print').onclick=()=>printLabel(p);}
function closeLabel(){$('label-modal').classList.add('hidden');document.body.style.overflow='';}
function printLabel(p){
 const w=window.open('','_blank','width=900,height=700');if(!w){status('products-status','Permita pop-ups para abrir a impressão da etiqueta.');return}
 const css='@page{size:100mm 66mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:100mm;height:66mm;font-family:Arial,Helvetica,sans-serif;color:#000}.print-label{width:100mm;height:66mm;padding:1.7mm;border:.2mm solid #111;overflow:hidden;display:flex;flex-direction:column;gap:.8mm}.label-top{display:flex;align-items:flex-start;gap:2mm;min-height:19mm}.label-top-copy{flex:1;min-width:0}.label-title{text-align:center;font-size:8pt;font-weight:800;line-height:1.05;margin:0 0 .8mm;text-transform:uppercase}.label-ingredients{font-size:5.8pt;line-height:1.1;overflow-wrap:anywhere}.label-allergy{font-size:5.7pt;line-height:1.1;font-weight:700;margin-top:.8mm;overflow-wrap:anywhere}.label-qr{width:19.8mm;height:19.8mm;object-fit:contain;flex:none;margin:-1mm 1mm 0 0}.label-qr-placeholder{width:18mm;height:18mm;flex:none;font-size:5.3pt;display:grid;place-items:center}.label-bottom{display:flex;gap:2mm;flex:1;min-height:0}.label-nutrition{flex:1;min-width:0;display:flex;flex-direction:column}.label-nutrition-head{display:flex;align-items:baseline;gap:1mm;font-size:5.8pt;white-space:nowrap;margin-bottom:.4mm}.label-nutrition-head strong{font-size:6.4pt;font-style:italic}.label-table{border-collapse:collapse;width:100%;font-size:5.8pt;line-height:.98;table-layout:fixed}.label-table th,.label-table td{border:.2mm solid #222;padding:.4mm .55mm;text-align:left;font-weight:400}.label-table thead th{font-weight:700}.label-table th:first-child{width:45%}.label-table th:nth-child(2){width:40%}.label-table th:nth-child(3){width:15%}.label-note{font-size:5.3pt;line-height:1.08;margin-top:.6mm}.label-side{width:20mm;flex:none;display:flex;align-items:stretch;justify-content:flex-start;gap:1mm;min-height:0}.label-stamp{width:10mm;flex:none;height:100%;border:.25mm solid #000;border-radius:1mm;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:1mm;gap:1mm;font-size:4.5pt;line-height:1.05;text-align:center}.label-stamp span{display:block;flex:1;width:100%}.label-storage-vertical{writing-mode:vertical-rl;transform:rotate(180deg);font-size:5pt;line-height:1.08;text-align:left;overflow:hidden;flex:1;max-width:4mm}.label-validity{writing-mode:vertical-rl;transform:rotate(180deg);font-size:5pt;font-weight:800;line-height:1.05;text-align:center;white-space:nowrap;flex:none;width:3mm}@media screen{body{background:#eee;padding:12px;width:auto;height:auto}.print-label{margin:0 auto;background:#fff;box-shadow:0 2px 12px #0003}}';;
 w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Etiqueta - '+escLabel(p.name)+'</title><style>'+css+'</style></head><body>'+labelMarkup(p)+'<script>window.onload=()=>setTimeout(()=>window.print(),250)<\\/script></body></html>');w.document.close();
}
$('close-label').addEventListener('click',closeLabel);
$('label-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-label]'))closeLabel()});

/* Integração API: disponível somente dentro do painel autenticado. */
let integrationTokenVisible=false;
async function loadIntegrationSettings(){
  status('integration-status','Carregando dados da API…');
  try{
    const data=await api('/api/admin/integration');
    $('integration-url').value=data.apiUrl;
    $('integration-token').value=data.apiKey||'';
    $('integration-token').placeholder=data.apiKey?'':'Nenhum token gerado';
    $('toggle-integration-token').disabled=!data.apiKey;
    $('copy-integration-token').disabled=!data.apiKey;
    integrationTokenVisible=false;$('integration-token').type='password';$('toggle-integration-token').textContent='Mostrar token';
    status('integration-status',data.apiKey?'Token atual carregado.':'Gere um token para iniciar a integração.');
  }catch(err){status('integration-status',err.message)}
}
$('open-integration').addEventListener('click',async()=>{
  $('integration-modal').classList.remove('hidden');document.body.style.overflow='hidden';
  await loadIntegrationSettings();
});
function closeIntegrationModal(){$('integration-modal').classList.add('hidden');document.body.style.overflow=''}
$('close-integration').addEventListener('click',closeIntegrationModal);
$('integration-modal').addEventListener('click',e=>{if(e.target.matches('[data-close-integration]'))closeIntegrationModal()});
$('toggle-integration-token').addEventListener('click',()=>{
  integrationTokenVisible=!integrationTokenVisible;
  $('integration-token').type=integrationTokenVisible?'text':'password';
  $('toggle-integration-token').textContent=integrationTokenVisible?'Ocultar token':'Mostrar token';
});
$('copy-integration-url').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('integration-url').value);status('integration-status','URL copiada.')}
  catch{status('integration-status','Não foi possível copiar automaticamente. Selecione e copie a URL.')}
});
$('copy-integration-token').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('integration-token').value);status('integration-status','Token copiado.')}
  catch{status('integration-status','Não foi possível copiar automaticamente. Mostre e copie o token manualmente.')}
});
$('generate-integration-token').addEventListener('click',async()=>{
  if(!confirm('Gerar um novo token? O token atual deixará de funcionar imediatamente.'))return;
  const button=$('generate-integration-token');button.disabled=true;status('integration-status','Gerando novo token…');
  try{
    const data=await api('/api/admin/integration/rotate',{method:'POST',body:JSON.stringify({})});
    $('integration-token').value=data.apiKey;$('integration-token').type='text';integrationTokenVisible=true;
    $('toggle-integration-token').disabled=false;$('toggle-integration-token').textContent='Ocultar token';$('copy-integration-token').disabled=false;
    status('integration-status','Novo token gerado. Copie-o e atualize a credencial no sistema de receitas.');
  }catch(err){status('integration-status',err.message)}
  finally{button.disabled=false}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('version-modal').classList.contains('hidden'))closeVersionForm();
  if(e.key==='Escape'&&!$('integration-modal').classList.contains('hidden'))closeIntegrationModal();
});
