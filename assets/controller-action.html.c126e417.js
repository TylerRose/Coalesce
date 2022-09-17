import{_ as D,r as a,o as r,c as i,b as n,d as e,w as t,e as s,a as p}from"./app.83c59791.js";const d={},y=n("h1",{id:"controlleraction",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#controlleraction","aria-hidden":"true"},"#"),s(" [ControllerAction]")],-1),C=s("Specifies how a "),h=s("custom method"),u=s(" is exposed via HTTP. Can be used to customize the HTTP method/verb for the method, as well as caching behavior."),m=p(`<h2 id="example-usage" tabindex="-1"><a class="header-anchor" href="#example-usage" aria-hidden="true">#</a> Example Usage</h2><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Person</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">PersonId</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">LastName</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">PictureHash</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">Coalesce</span><span style="color:#D4D4D4;">]</span></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">ControllerAction</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">Method</span><span style="color:#D4D4D4;"> = </span><span style="color:#9CDCFE;">HttpMethod</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">Get</span><span style="color:#D4D4D4;">)]</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">static</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">long</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">PersonCount</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">AppDbContext</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">db</span><span style="color:#D4D4D4;">, </span><span style="color:#569CD6;">string</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">lastNameStartsWith</span><span style="color:#D4D4D4;"> = </span><span style="color:#CE9178;">&quot;&quot;</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">db</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">People</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">Count</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">f</span><span style="color:#D4D4D4;"> =&gt; </span><span style="color:#9CDCFE;">f</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">LastName</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">StartsWith</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">lastNameStartsWith</span><span style="color:#D4D4D4;">));</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">Coalesce</span><span style="color:#D4D4D4;">]</span></span>
<span class="line"><span style="color:#D4D4D4;">    [</span><span style="color:#4EC9B0;">ControllerAction</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">HttpMethod</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">Get</span><span style="color:#D4D4D4;">, </span><span style="color:#9CDCFE;">VaryByProperty</span><span style="color:#D4D4D4;"> = </span><span style="color:#569CD6;">nameof</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">PictureHash</span><span style="color:#D4D4D4;">))]</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">IFile</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">GetPicture</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">AppDbContext</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">db</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">new</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">IntelliTect</span><span style="color:#D4D4D4;">.</span><span style="color:#4EC9B0;">Coalesce</span><span style="color:#D4D4D4;">.</span><span style="color:#4EC9B0;">Models</span><span style="color:#D4D4D4;">.</span><span style="color:#4EC9B0;">File</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">db</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">PersonPictures</span></span>
<span class="line"><span style="color:#D4D4D4;">            .</span><span style="color:#DCDCAA;">Where</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">x</span><span style="color:#D4D4D4;"> =&gt; </span><span style="color:#9CDCFE;">x</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">PersonId</span><span style="color:#D4D4D4;"> == </span><span style="color:#569CD6;">this</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">PersonId</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">            .</span><span style="color:#DCDCAA;">Select</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">x</span><span style="color:#D4D4D4;"> =&gt; </span><span style="color:#9CDCFE;">x</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">Content</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">        )</span></span>
<span class="line"><span style="color:#D4D4D4;">        {</span></span>
<span class="line"><span style="color:#D4D4D4;">            </span><span style="color:#9CDCFE;">ContentType</span><span style="color:#D4D4D4;"> = </span><span style="color:#CE9178;">&quot;image/jpg&quot;</span><span style="color:#D4D4D4;">,</span></span>
<span class="line"><span style="color:#D4D4D4;">        };</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h2>`,3),v=p("<p>The HTTP method to use on the generated API Controller.</p><p>Enum values are:</p><ul><li><code>HttpMethod.Post</code> Use the POST method.</li><li><code>HttpMethod.Get</code> Use the GET method.</li><li><code>HttpMethod.Put</code> Use the PUT method.</li><li><code>HttpMethod.Delete</code> Use the DELETE method.</li><li><code>HttpMethod.Patch</code> Use the PATCH method.</li></ul>",3),_=s("For HTTP GET model instance methods, if "),b=n("code",null,"VaryByProperty",-1),E=s(" is set to the name of a property on the parent model class, "),g={href:"https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag",target:"_blank",rel:"noopener noreferrer"},P=s("ETag headers"),f=s(" based on the value of this property will be used to implement caching. If the client provides a matching "),F=n("code",null,"If-None-Match",-1),T=s(" Header with the request, the method will not be invoked and HTTP Status `304 Not Modified`` will be returned."),x=s("Additionally, if the "),A=n("code",null,"VaryByProperty",-1),B=s(" is set to a client-exposed "),H=s("property"),w=s(", the value of the property will be included in the query string when performing API calls to invoke the method. If the query string value matches the current value on the model, a long-term "),M=n("code",null,"Cache-Control",-1),k=s(" header will be set on the response, allowing the client to avoid making future invocations to the same method while the value of the "),I=n("code",null,"VaryByProperty",-1),N=s(" remains the same.");function S(V,U){const l=a("RouterLink"),o=a("Prop"),c=a("ExternalLinkIcon");return r(),i("div",null,[y,n("p",null,[C,e(l,{to:"/modeling/model-components/methods.html"},{default:t(()=>[h]),_:1}),u]),m,e(o,{def:"public HttpMethod Method { get; set; } = HttpMethod.Post;",ctor:"1"}),v,e(o,{def:"public string VaryByProperty { get; set; }"}),n("p",null,[_,b,E,n("a",g,[P,e(c)]),f,F,T]),n("p",null,[x,A,B,e(l,{to:"/modeling/model-components/properties.html"},{default:t(()=>[H]),_:1}),w,M,k,I,N])])}const L=D(d,[["render",S],["__file","controller-action.html.vue"]]);export{L as default};
