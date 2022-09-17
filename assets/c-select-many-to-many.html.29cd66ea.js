import{_ as r,r as l,o as i,c as d,f as p,b as s,d as n,w as o,e,a as u}from"./app.83c59791.js";const m={},D=s("h1",{id:"c-select-many-to-many",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#c-select-many-to-many","aria-hidden":"true"},"#"),e(" c-select-many-to-many")],-1),y=e("A multi-select dropdown component that allows for selecting values fetched from the generated "),h=s("code",null,"/list",-1),_=e(" API endpoints for collection navigation properties that were annotated with "),v=e("[ManyToMany]"),f=e("."),b={class:"custom-container tip"},g=s("p",{class:"custom-container-title"},"TIP",-1),C=e("It is unlikely that you'll ever need to use this component directly - it is highly recommended that you use "),E=e("c-input"),x=e(" instead and let it delegate to "),k=e("c-select-many-to-many"),w=e(" for you."),P={class:"table-of-contents"},q=e("Examples"),F=e("Props"),A=u(`<h2 id="examples" tabindex="-1"><a class="header-anchor" href="#examples" aria-hidden="true">#</a> Examples</h2><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-select-many-to-many</span><span style="color:#D4D4D4;"> :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">case</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;caseProducts&quot;</span><span style="color:#D4D4D4;"> /</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-select-many-to-many</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    :</span><span style="color:#9CDCFE;">model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">case</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;caseProducts&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">dense</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">outlined</span></span>
<span class="line"><span style="color:#D4D4D4;">/</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-vue-html ext-vue-html line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#808080;">&lt;</span><span style="color:#569CD6;">c-select-many-to-many</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">v-model</span><span style="color:#D4D4D4;">=</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#9CDCFE;">case</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">caseProducts</span><span style="color:#D4D4D4;">&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">for</span><span style="color:#D4D4D4;">=</span><span style="color:#CE9178;">&quot;Case.caseProducts&quot;</span><span style="color:#D4D4D4;"> </span></span>
<span class="line"><span style="color:#D4D4D4;">/</span><span style="color:#808080;">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="props" tabindex="-1"><a class="header-anchor" href="#props" aria-hidden="true">#</a> Props</h2>`,5),M=s("p",null,"A metadata specifier for the value being bound. One of:",-1),I=s("ul",null,[s("li",null,[e("A string with the name of the value belonging to "),s("code",null,"model"),e(".")]),s("li",null,"A direct reference to a metadata object."),s("li",null,"A string in dot-notation that starts with a type name.")],-1),N={class:"custom-container tip"},R=s("p",{class:"custom-container-title"},"Note",-1),V=e('c-select-many-to-many expects metadata for the "real" collection navigation property on a model. If you provide it the string you passed to '),T=e("[ManyToMany]"),S=e(", an error wil be thrown."),j=s("p",null,[e("An object owning the value that was specified by the "),s("code",null,"for"),e(" prop. If provided, the input will be bound to the corresponding property on the "),s("code",null,"model"),e(" object.")],-1),B=s("p",null,[e("If binding the component with "),s("code",null,"v-model"),e(", accepts the "),s("code",null,"value"),e(" part of "),s("code",null,"v-model"),e(".")],-1),L=e("An optional set of "),K=e("Data Source Standard Parameters"),O=e(" to pass to API calls made to the server.");function z(G,H){const t=l("RouterLink"),c=l("router-link"),a=l("Prop");return i(),d("div",null,[D,p(" MARKER:summary "),s("p",null,[y,h,_,n(t,{to:"/modeling/model-components/attributes/many-to-many.html"},{default:o(()=>[v]),_:1}),f]),p(" MARKER:summary-end "),s("div",b,[g,s("p",null,[C,n(t,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-input.html"},{default:o(()=>[E]),_:1}),x,n(t,{to:"/stacks/vue/coalesce-vue-vuetify/components/c-select-many-to-many.html"},{default:o(()=>[k]),_:1}),w])]),s("nav",P,[s("ul",null,[s("li",null,[n(c,{to:"#examples"},{default:o(()=>[q]),_:1})]),s("li",null,[n(c,{to:"#props"},{default:o(()=>[F]),_:1})])])]),A,n(a,{def:"for: string | Property | Value",lang:"ts"}),M,I,s("div",N,[R,s("p",null,[V,n(t,{to:"/modeling/model-components/attributes/many-to-many.html"},{default:o(()=>[T]),_:1}),S])]),n(a,{def:"model?: Model",lang:"ts"}),j,n(a,{def:"value: any",lang:"ts"}),B,n(a,{def:"params?: ListParameters",lang:"ts"}),s("p",null,[L,n(t,{to:"/modeling/model-components/data-sources.html#standard-parameters"},{default:o(()=>[K]),_:1}),O])])}const Q=r(m,[["render",z],["__file","c-select-many-to-many.html.vue"]]);export{Q as default};
