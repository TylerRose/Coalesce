import{_ as o,r as p,o as t,c as r,b as s,d as l,w as e,e as n,a as D}from"./app.83c59791.js";const c={},i=s("h1",{id:"internaluse",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#internaluse","aria-hidden":"true"},"#"),n(" [InternalUse]")],-1),y=s("p",null,"Used to mark a type, property or method for internal use. Internal Use members are:",-1),d=s("ul",null,[s("li",null,"Not exposed via the API."),s("li",null,"Not present in the generated TypeScript view models."),s("li",null,"Not present nor accounted for in the generated C# DTOs."),s("li",null,"Not present in the generated editor or list views.")],-1),C=n("Effectively, an Internal Use member is invisible to Coalesce. This attribute can be considered a "),u=n("Security Attribute"),m=n("."),h=s("p",null,[n("Note that this only needs to be used on members that are public. Non-public members (including "),s("code",null,"internal"),n(") are always invisible to Coalesce.")],-1),v=s("h2",{id:"example-usage",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#example-usage","aria-hidden":"true"},"#"),n(" Example Usage")],-1),b=n("In this example, "),_=s("code",null,"Color",-1),E=n(" is the property exposed to the API, but "),x=s("code",null,"ColorHex",-1),A=n(" is the property that maps to the database that stores the value. A helper method also exists for the color generation, but needs no attribute to be hidden since methods must be explicitly exposed with "),g=n("[Coalesce]"),f=n("."),B=D(`<p>If no color is saved in the database (the user hasn&#39;t picked a color), one is deterministically created.</p><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">ApplicationUser</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">ApplicationUserId</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">InternalUse</span><span style="color:#D4D4D4;">]</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">ColorHex</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">NotMapped</span><span style="color:#D4D4D4;">]</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">Color</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;"> =&gt; </span><span style="color:#9CDCFE;">ColorHex</span><span style="color:#D4D4D4;"> ?? </span><span style="color:#DCDCAA;">GenerateColor</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">ApplicationUserId</span><span style="color:#D4D4D4;">).</span><span style="color:#DCDCAA;">ToRGBHexString</span><span style="color:#D4D4D4;">();</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;"> =&gt; </span><span style="color:#9CDCFE;">ColorHex</span><span style="color:#D4D4D4;"> = </span><span style="color:#9CDCFE;">value</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">static</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">HSLColor</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">GenerateColor</span><span style="color:#D4D4D4;">(</span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;">? </span><span style="color:#9CDCFE;">seed</span><span style="color:#D4D4D4;"> = </span><span style="color:#569CD6;">null</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#569CD6;">var</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">random</span><span style="color:#D4D4D4;"> = </span><span style="color:#9CDCFE;">seed</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">HasValue</span><span style="color:#D4D4D4;"> ? </span><span style="color:#569CD6;">new</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Random</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">seed</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">Value</span><span style="color:#D4D4D4;">) : </span><span style="color:#569CD6;">new</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Random</span><span style="color:#D4D4D4;">();</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">new</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">HSLColor</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">random</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">NextDouble</span><span style="color:#D4D4D4;">(), </span><span style="color:#9CDCFE;">random</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">Next</span><span style="color:#D4D4D4;">(</span><span style="color:#B5CEA8;">40</span><span style="color:#D4D4D4;">, </span><span style="color:#B5CEA8;">100</span><span style="color:#D4D4D4;">) / </span><span style="color:#B5CEA8;">100d</span><span style="color:#D4D4D4;">, </span><span style="color:#9CDCFE;">random</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">Next</span><span style="color:#D4D4D4;">(</span><span style="color:#B5CEA8;">25</span><span style="color:#D4D4D4;">, </span><span style="color:#B5CEA8;">65</span><span style="color:#D4D4D4;">) / </span><span style="color:#B5CEA8;">100d</span><span style="color:#D4D4D4;">);</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function F(N,I){const a=p("RouterLink");return t(),r("div",null,[i,y,d,s("p",null,[C,l(a,{to:"/modeling/model-components/attributes/security-attribute.html"},{default:e(()=>[u]),_:1}),m]),h,v,s("p",null,[b,_,E,x,A,l(a,{to:"/modeling/model-components/attributes/coalesce.html"},{default:e(()=>[g]),_:1}),f]),B])}const w=o(c,[["render",F],["__file","internal-use.html.vue"]]);export{w as default};
