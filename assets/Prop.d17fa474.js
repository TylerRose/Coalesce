import{l as f,m as u,_ as g,o as h,c as l,f as m,b as d,t as _,e as c}from"./app.83c59791.js";var n=new Map;async function b(t){const e=await u(()=>import("./index.esm.dea45d94.js"),[]);return e.setCDN("https://unpkg.com/shiki/"),{highlighter:await e.getHighlighter({theme:"dark-plus",langs:[t]}),shiki:e}}function y(t){if(n.has(t))return n.get(t);const e=b(t);return n.set(t,e),e}const k=f({props:{def:{type:String,required:!0},lang:{type:String,default:"c#"},ctor:{type:[Number,String],default:null},noClass:{type:Boolean,default:!1},id:{type:String,default:null},idPrefix:{type:String,default:"member"}},data(){return{idAttr:"",html:""}},async serverPrefetch(){await this.renderHtml()},beforeMount(){var t,e;this.html=(t=this.$el)==null?void 0:t.innerHTML,this.idAttr=(e=this.$el)==null?void 0:e.id,this.html||this.$watch("def",()=>this.renderHtml(),{immediate:!0})},methods:{async renderHtml(){var t=null;this.ctor&&(t="// Also settable via constructor parameter #"+this.ctor,(this.lang=="c#"||this.lang=="csharp")&&!this.def.match(/\bset\b/)&&(t="// ONLY settable via constructor parameter #"+this.ctor));const e=(this.noClass?"":"public class x {")+(t?`
`+t:"")+`
`+this.def+(this.noClass?"":`
}`);if(this.id)this.idAttr=this.id;else if(this.lang=="ts"){const i=/(?:(?:readonly|public|static|protected|private|abstract|export) )*((?:namespace )?[\w$]+)/.exec(this.def);this.idAttr=i?this.idPrefix+"-"+i[1]:null}else if(this.lang=="c#"){const i=/ (\w+)(?:<|\(| \{|$)/.exec(this.def);this.idAttr=i?this.idPrefix+"-"+i[1]:null}if(!this.idAttr)throw new Error("Unable to compute id for Prop "+this.def);this.idAttr=this.idAttr.toLowerCase().replace(/[ &<>"']/g,"-").replace(/\$/g,"_");const{highlighter:s,shiki:a}=await y(this.lang),r=s.codeToThemedTokens(e,this.lang);this.noClass||(r.shift(),r.pop());const o=s.getTheme();let p=a.renderToHtml(r,{fg:o.fg,bg:o.bg});this.html=`<a class="header-anchor" href="#${this.idAttr}" aria-hidden="true">#</a>${p}`}}});const A=["innerHTML","id"],v=["id"],$={class:"shiki",style:{"background-color":"#1E1E1E","line-height":"1.18","padding-top":"1px","padding-bottom":"4px"}},w=c("      "),T=c(`
    `);function P(t,e,s,a,r,o){return t.html?(h(),l("h4",{key:0,innerHTML:t.html,class:"code-prop",id:t.idAttr},null,8,A)):(h(),l("h4",{key:1,class:"code-prop",id:t.idAttr},[m(" Temporary uncolored content that matches the result as best as possible to avoid FOUC "),d("pre",$,[w,d("code",null,`
        `+_(t.def)+`
      `,1),T])],8,v))}const C=g(k,[["render",P],["__file","Prop.vue"]]);export{C as default};
