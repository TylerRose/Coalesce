import{_ as t,r as e,o as p,c,b as s,d as a,w as r,e as n,a as i}from"./app.83c59791.js";const D={},y=s("h1",{id:"manytomany",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#manytomany","aria-hidden":"true"},"#"),n(" [ManyToMany]")],-1),d=s("p",null,"Used to specify a Many to Many relationship. Because EF core does not support automatic intermediate mapping tables, this field is used to allow for direct reference of the many-to-many collections from the ViewModel.",-1),h=n("The named specified in the attribute will be used as the name of a collection of the objects on the other side of the relationship in the generated "),m=n("TypeScript ViewModels"),u=n("."),C=i(`<h2 id="example-usage" tabindex="-1"><a class="header-anchor" href="#example-usage" aria-hidden="true">#</a> Example Usage</h2><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Person</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">PersonId</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">FirstName</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">LastName</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">ManyToMany</span><span style="color:#D4D4D4;">(</span><span style="color:#CE9178;">&quot;Appointments&quot;</span><span style="color:#D4D4D4;">)]</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">ICollection</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">PersonAppointment</span><span style="color:#D4D4D4;">&gt; </span><span style="color:#9CDCFE;">PersonAppointments</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h2>`,3),_=s("p",null,"The name of the collection that will contain the set of objects on the other side of the many-to-many relationship.",-1);function b(v,f){const o=e("RouterLink"),l=e("Prop");return p(),c("div",null,[y,d,s("p",null,[h,a(o,{to:"/stacks/disambiguation/view-model.html"},{default:r(()=>[m]),_:1}),u]),C,a(l,{def:"public string CollectionName { get; }",ctor:"1"}),_])}const E=t(D,[["render",b],["__file","many-to-many.html.vue"]]);export{E as default};
