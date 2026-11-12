import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

const styles = {
 page:{minHeight:'100vh',padding:'24px clamp(16px,5vw,70px) 60px',background:'radial-gradient(ellipse at top right,#4a202e 0,transparent 45%),#1c1014',color:'#f9eee2',fontFamily:'Inter,system-ui,sans-serif'},
 header:{maxWidth:1180,margin:'0 auto 42px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,borderBottom:'1px solid #65434c',paddingBottom:18},
 logo:{width:155,maxWidth:'40vw'},
 link:{display:'inline-flex',alignItems:'center',gap:8,color:'#e5c780',textDecoration:'none',fontSize:14},
 heading:{maxWidth:900,margin:'0 auto 42px',textAlign:'center'},
 eyebrow:{fontSize:11,letterSpacing:'.2em',color:'#d7b36a',textTransform:'uppercase'},
 title:{font:'400 clamp(38px,5vw,64px) Georgia,serif',lineHeight:1.1,margin:'12px 0',color:'#fff4e6'},
 intro:{color:'#d7c7c1',fontSize:17,lineHeight:1.8},
 product:{maxWidth:1180,margin:'0 auto 46px',padding:'28px 0',borderTop:'1px solid #65434c'},
 productHeading:{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:18},
 productName:{font:'400 clamp(28px,4vw,40px) Georgia,serif',margin:0},
 cardGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:18},
 card:{background:'#24151b',border:'1px solid #65434c',borderRadius:12,overflow:'hidden'},
 image:{width:'100%',height:230,objectFit:'cover',background:'#2b1920'},
 body:{padding:20},
 size:{padding:'12px 0',borderTop:'1px solid #65434c',display:'flex',flexDirection:'column',gap:5,color:'#d7c7c1',fontSize:13},
 action:{display:'inline-flex',alignItems:'center',gap:8,color:'#e5c780',textDecoration:'none',marginTop:12,fontWeight:600},
 empty:{textAlign:'center',padding:30,color:'#d7c7c1'}
};

export default function VersionsPage(){
 const [products,setProducts]=useState([]);
 const [loading,setLoading]=useState(true);
 const selected=new URLSearchParams(window.location.search).get('produto');
 useEffect(()=>{let active=true;fetch('/api/products').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(items=>{if(active)setProducts(Array.isArray(items)?items:[])}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 const visible=useMemo(()=>products.filter(p=>!selected||p.slug===selected),[products,selected]);
 return <main style={styles.page}>
  <header style={styles.header}><a href="/" aria-label="LM Pudins"><img src="/images/Logo%20horizontal.png" alt="LM Pudins" style={styles.logo}/></a><a href={selected?'/produto/'+encodeURIComponent(selected):'/#sabores'} style={styles.link}><ArrowLeft size={16}/> Voltar aos sabores</a></header>
  <section style={styles.heading}><p style={styles.eyebrow}>LM PUDINS · APRESENTAÇÕES</p><h1 style={styles.title}>Nossas versões</h1><p style={styles.intro}>Cada sabor pode ser apreciado em diferentes apresentações. Conheça o Copo americano e as versões em forminha, com seus tamanhos e composições.</p></section>
  {loading?<p style={styles.empty}>Carregando apresentações…</p>:visible.length===0?<p style={styles.empty}>Nenhum sabor encontrado.</p>:visible.map(product=><section key={product.slug} style={styles.product}>
   <div style={styles.productHeading}><h2 style={styles.productName}>{product.name}</h2><a href={'/produto/'+encodeURIComponent(product.slug)} style={styles.link}>Conhecer sabor <ArrowUpRight size={15}/></a></div>
   {Array.isArray(product.presentations)&&product.presentations.length>0?<div style={styles.cardGrid}>{product.presentations.map(presentation=><article key={presentation.key||presentation.name} style={styles.card}>
    {presentation.image&&<img src={presentation.image} alt={presentation.name} style={styles.image}/>}
    <div style={styles.body}><h3>{presentation.name}</h3>{(presentation.description)&&<p>{presentation.description}</p>}
     {(presentation.sizes||[]).map(size=><div key={size.name} style={styles.size}><strong>{size.name}</strong><span>{size.finalWeightG?('Peso líquido final: '+size.finalWeightG+' g'):'Peso líquido final a confirmar após o cozimento'}</span>{size.components&&<small>{['carameloG','massaG','geleiaG'].filter(k=>size.components[k]!==undefined).map(k=>{const v=size.components[k];return (k==='carameloG'?'Caramelo':k==='massaG'?'Massa':'Geleia')+': '+(typeof v==='object'?(v.min+'–'+v.max):v)+' g'}).join(' · ')}</small>}{size.image&&<img src={size.image} alt={presentation.name+' '+size.name} style={{...styles.image,height:150,marginTop:8}}/>}</div>)}
    </div></article>)}</div>:<p style={styles.intro}>As apresentações deste sabor ainda não foram cadastradas.</p>}
  </section>)}
  <footer style={{textAlign:'center',borderTop:'1px solid #65434c',paddingTop:22,color:'#cbb9b7'}}>© LM Pudins · Uma doce assinatura</footer>
 </main>
}