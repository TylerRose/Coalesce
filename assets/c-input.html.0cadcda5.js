import{_ as d,r as a,o as u,c as _,f as c,b as e,d as o,w as t,e as s,a as r}from"./app.83c59791.js";const h={},D=e("h1",{id:"c-input",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#c-input","aria-hidden":"true"},"#"),s(" c-input")],-1),m=s("A general-purpose input component for most "),y=s("Values"),f=s(". c-input does not have much functionality of its own - instead, it delegates to the right kind of component based on the type of value to which it is bound. This includes both other "),v=s("Coalesce Vuetify Components"),b=s(" as well as direct usages of some "),g={href:"https://vuetifyjs.com/",target:"_blank",rel:"noopener noreferrer"},C=s("Vuetify"),E=s(" components."),k=s("All attributes are passed through to the delegated-to component, allowing for full customization of the underlying "),x={href:"https://vuetifyjs.com/",target:"_blank",rel:"noopener noreferrer"},F=s("Vuetify"),w=s(" component."),q=e("p",null,"A summary of the components delegated to, by type:",-1),j=s("string: "),A={href:"https://vuetifyjs.com/en/components/text-fields/",target:"_blank",rel:"noopener noreferrer"},N=s("v-text-field"),V=s(", or "),M={href:"https://vuetifyjs.com/en/components/textarea/",target:"_blank",rel:"noopener noreferrer"},R=s("v-textarea"),P=s(" if flag attribute "),T=e("code",null,"textarea",-1),I=s(" is provided to "),S=e("code",null,"c-input",-1),B=s(" or if "),L=e("code",null,"[DataType(DataType.MultilineText)]",-1),K=s(" is present in C#."),z=s("number: "),O={href:"https://vuetifyjs.com/en/components/text-fields/",target:"_blank",rel:"noopener noreferrer"},U=s("v-text-field"),W=s("."),G=s("boolean: "),$={href:"https://vuetifyjs.com/en/components/selection-controls/",target:"_blank",rel:"noopener noreferrer"},H=s("v-switch"),J=s(", or "),Q={href:"https://vuetifyjs.com/en/components/selection-controls/",target:"_blank",rel:"noopener noreferrer"},X=s("v-checkbox"),Y=s(" if flag attribute "),Z=e("code",null,"checkbox",-1),ss=s(" is provided to "),es=e("code",null,"c-input",-1),os=s("."),ts=s("enum: "),ns={href:"https://vuetifyjs.com/en/components/selects/",target:"_blank",rel:"noopener noreferrer"},ls=s("v-select"),as=s("file: "),cs={href:"https://vuetifyjs.com/en/components/file-inputs/",target:"_blank",rel:"noopener noreferrer"},rs=s("v-file-input"),is=s("date: "),ps=s("c-datetime-picker"),ds=s("model: "),us=s("c-select"),_s=s("[ManyToMany]"),hs=s(" collection: "),Ds=s("c-select-many-to-many"),ms=s("Non-object collection: "),ys=s("c-select-values"),fs=s("Any other unsupported type will simply be displayed with "),vs=s("c-display"),bs=s(", unless a "),gs={href:"https://vuejs.org/v2/guide/components-slots.html",target:"_blank",rel:"noopener noreferrer"},Cs=s("default slot"),Es=s(" is provided - in that case, the default slot will be rendered instead."),ks=s("When bound to a "),xs=s("ViewModel"),Fs=s(", the "),ws=s("validation rules"),qs=s(" for the bound property will be obtained from the "),js=s("ViewModel"),As=s(" and passed to "),Ns={href:"https://vuetifyjs.com/",target:"_blank",rel:"noopener noreferrer"},Vs=s("Vuetify"),Ms=s("'s "),Rs=e("code",null,"rules",-1),Ps=s(" prop."),Ts={class:"table-of-contents"},Is=s("Examples"),Ss=s("Props"),Bs=s("Slots"),Ls=r(`<h2 id="examples" tabindex="-1"><a class="header-anchor" href="#examples" aria-hidden="true">#</a> Examples</h2><p>Typical usage, providing an object and a property on that object:</p><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">person</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;firstName&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,3),Ks=s("Customizing the "),zs={href:"https://vuetifyjs.com/",target:"_blank",rel:"noopener noreferrer"},Os=s("Vuetify"),Us=s(" component used:"),Ws=r(`<div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">comment</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;content&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">textarea</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">solo</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,1),Gs=s("Binding to "),$s=s("API Caller"),Hs=s(" args objects:"),Js=r(`<div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">person</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">setFirstName</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;newName&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Or, using a more verbose syntax:</p><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">person</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">setFirstName</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">args</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;Person.methods.setFirstName.newName&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3),Qs=s("Binding to "),Xs=s("Data Source Parameters"),Ys=s(":"),Zs=r(`<div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">personList</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">$dataSource</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;startsWith&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>Usage with <code>v-model</code> (this scenario is atypical - the model/for pair of props are used in almost all scenarios):</p><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-input</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">v-model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">person</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">firstName</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;Person.firstName&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="props" tabindex="-1"><a class="header-anchor" href="#props" aria-hidden="true">#</a> Props</h2>`,4),se=e("p",null,"A metadata specifier for the value being bound. One of:",-1),ee=e("ul",null,[e("li",null,[s("A string with the name of the value belonging to "),e("code",null,"model"),s(".")]),e("li",null,"A direct reference to a metadata object."),e("li",null,"A string in dot-notation that starts with a type name.")],-1),oe=e("p",null,[s("An object owning the value that was specified by the "),e("code",null,"for"),s(" prop. If provided, the input will be bound to the corresponding property on the "),e("code",null,"model"),s(" object.")],-1),te=e("p",null,[s("If binding the component with "),e("code",null,"v-model"),s(", accepts the "),e("code",null,"value"),s(" part of "),e("code",null,"v-model"),s(".")],-1),ne=e("h2",{id:"slots",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#slots","aria-hidden":"true"},"#"),s(" Slots")],-1),le=e("p",null,[e("code",null,"default"),s(" - Used to display fallback content if c-input does not support the type of the value being bound. Generally this does not need to be used, as you should avoid creating c-input components for unsupported types in the first place.")],-1);function ae(ce,re){const n=a("RouterLink"),l=a("ExternalLinkIcon"),i=a("router-link"),p=a("Prop");return u(),_("div",null,[D,c(" MARKER:summary "),e("p",null,[m,o(n,{to:"/stacks/vue/layers/metadata.html"},{default:t(()=>[y]),_:1}),f,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/overview.html"},{default:t(()=>[v]),_:1}),b,e("a",g,[C,o(l)]),E]),c(" MARKER:summary-end "),e("p",null,[k,e("a",x,[F,o(l)]),w]),q,e("ul",null,[e("li",null,[j,e("a",A,[N,o(l)]),V,e("a",M,[R,o(l)]),P,T,I,S,B,L,K]),e("li",null,[z,e("a",O,[U,o(l)]),W]),e("li",null,[G,e("a",$,[H,o(l)]),J,e("a",Q,[X,o(l)]),Y,Z,ss,es,os]),e("li",null,[ts,e("a",ns,[ls,o(l)])]),e("li",null,[as,e("a",cs,[rs,o(l)])]),e("li",null,[is,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-datetime-picker.html"},{default:t(()=>[ps]),_:1})]),e("li",null,[ds,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-select.html"},{default:t(()=>[us]),_:1})]),e("li",null,[o(n,{to:"/modeling/model-components/attributes/many-to-many.html"},{default:t(()=>[_s]),_:1}),hs,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-select-many-to-many.html"},{default:t(()=>[Ds]),_:1})]),e("li",null,[ms,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-select-values.html"},{default:t(()=>[ys]),_:1})])]),e("p",null,[fs,o(n,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-display.html"},{default:t(()=>[vs]),_:1}),bs,e("a",gs,[Cs,o(l)]),Es]),e("p",null,[ks,o(n,{to:"/stacks/vue/layers/viewmodels.html"},{default:t(()=>[xs]),_:1}),Fs,o(n,{to:"/stacks/vue/layers/viewmodels.html#rules-validation"},{default:t(()=>[ws]),_:1}),qs,o(n,{to:"/stacks/vue/layers/viewmodels.html#rules-validation"},{default:t(()=>[js]),_:1}),As,e("a",Ns,[Vs,o(l)]),Ms,Rs,Ps]),e("nav",Ts,[e("ul",null,[e("li",null,[o(i,{to:"#examples"},{default:t(()=>[Is]),_:1})]),e("li",null,[o(i,{to:"#props"},{default:t(()=>[Ss]),_:1})]),e("li",null,[o(i,{to:"#slots"},{default:t(()=>[Bs]),_:1})])])]),Ls,e("p",null,[Ks,e("a",zs,[Os,o(l)]),Us]),Ws,e("p",null,[Gs,o(n,{to:"/stacks/vue/layers/api-clients.html#api-callers"},{default:t(()=>[$s]),_:1}),Hs]),Js,e("p",null,[Qs,o(n,{to:"/modeling/model-components/data-sources.html#custom-parameters"},{default:t(()=>[Xs]),_:1}),Ys]),Zs,c(" MARKER:c-for-model-props "),o(p,{def:"for?: string | Property | Value",lang:"ts"}),se,ee,o(p,{def:"model?: Model | DataSource",lang:"ts"}),oe,c(" MARKER:c-for-model-props-end "),o(p,{def:"value?: any",lang:"ts"}),te,ne,le])}const pe=d(h,[["render",ae],["__file","c-input.html.vue"]]);export{pe as default};
