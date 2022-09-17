import{_ as p,r,o as c,c as d,b as e,d as a,w as t,e as s,a as i}from"./app.83c59791.js";const D={},h=e("h1",{id:"behaviors",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#behaviors","aria-hidden":"true"},"#"),s(" Behaviors")],-1),y=e("p",null,[e("em",null,"In a CRUD system, creating, updating, and deleting are considered especially different from reading. In Coalesce, the dedicated classes that perform these operations are derivatives of a special interface known as the"),s(),e("code",null,"IBehaviors<T>"),s(". "),e("em",null,"These are their stories"),s(".")],-1),u=e("hr",null,null,-1),v=s("Coalesce separates out the parts of your API that read your data from the parts that mutate it. The read portion is performed by "),m=s("Data Sources"),b=s(", and the mutations are performed by behaviors. Like data sources, there exists a standard set of behaviors that Coalesce provides out-of-the-box that cover the most common use cases for creating, updating, and deleting objects in your data model."),C=e("p",null,"Also like data sources, these functions can be easily overridden on a per-model basis, allowing complete control over the ways in which your data is mutated by the APIs that Coalesce generates. However, unlike data sources which can have as many implementations per model as you like, you can only have one set of behaviors.",-1),f={class:"table-of-contents"},_=s("Defining Behaviors"),g=s("Dependency Injection"),T=s("Standard Behaviors"),E=s("Properties"),w=s("Method Overview"),I=s("Method Details"),S=s("Globally Replacing the Standard Behaviors"),A=e("h2",{id:"defining-behaviors",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#defining-behaviors","aria-hidden":"true"},"#"),s(" Defining Behaviors")],-1),B=e("p",null,[s("By default, each of your models that Coalesce exposes will utilize the standard behaviors ("),e("code",null,"IntelliTect.Coalesce.StandardBehaviors<T, TContext>"),s(") for the out-of-the-box API endpoints that Coalesce provides. These behaviors provide a set of create, update, and delete methods for an EF Core "),e("code",null,"DbContext"),s(", as well as a plethora of virtual methods that make the "),e("code",null,"StandardBehaviors"),s(" a great base class for your custom implementations. Unlike data sources which require an annotation to override the Coalesce-provided standard class, the simple presence of an explicitly declared set of behaviors will suppress the standard behaviors.")],-1),x={class:"custom-container tip"},k=e("p",{class:"custom-container-title"},"Note",-1),F=s("When you define a set of custom behaviors, take note that these are only used by the standard set of API endpoints that Coalesce always provides. They will not be used to handle any mutations in any "),j=s("Methods"),O=s(" you write for your models."),R=i(`<p>To create your own behaviors, you simply need to define a class that implements <code>IntelliTect.Coalesce.IBehaviors&lt;T&gt;</code>. To expose your behaviors to Coalesce, either place it as a nested class of the type <code>T</code> that your behaviors are for, or annotate it with the <code>[Coalesce]</code> attribute. Of course, the easiest way to create behaviors that doesn&#39;t require you to re-engineer a great deal of logic would be to inherit from <code>IntelliTect.Coalesce.StandardBehaviors&lt;T, TContext&gt;</code>, and then override only the parts that you need.</p><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Case</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">CaseId</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">int</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">OwnerId</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">bool</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">IsDeleted</span><span style="color:#D4D4D4;"> { </span><span style="color:#569CD6;">get</span><span style="color:#D4D4D4;">; </span><span style="color:#569CD6;">set</span><span style="color:#D4D4D4;">; }</span></span>
<span class="line"><span style="color:#D4D4D4;">    ...</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">[</span><span style="color:#4EC9B0;">Coalesce</span><span style="color:#D4D4D4;">]</span></span>
<span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">CaseBehaviors</span><span style="color:#D4D4D4;"> : </span><span style="color:#4EC9B0;">StandardBehaviors</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">Case</span><span style="color:#D4D4D4;">, </span><span style="color:#4EC9B0;">AppDbContext</span><span style="color:#D4D4D4;">&gt;</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">CaseBehaviors</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">CrudContext</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">AppDbContext</span><span style="color:#D4D4D4;">&gt; </span><span style="color:#9CDCFE;">context</span><span style="color:#D4D4D4;">) : </span><span style="color:#569CD6;">base</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">context</span><span style="color:#D4D4D4;">) { }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">override</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">ItemResult</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">BeforeSave</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">SaveKind</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">kind</span><span style="color:#D4D4D4;">, </span><span style="color:#4EC9B0;">Case</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">oldItem</span><span style="color:#D4D4D4;">, </span><span style="color:#4EC9B0;">Case</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#6A9955;">// Allow admins to bypass all validation.</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">if</span><span style="color:#D4D4D4;"> (</span><span style="color:#9CDCFE;">User</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">IsInRole</span><span style="color:#D4D4D4;">(</span><span style="color:#CE9178;">&quot;Admin&quot;</span><span style="color:#D4D4D4;">)) </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">true</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">if</span><span style="color:#D4D4D4;"> (</span><span style="color:#9CDCFE;">kind</span><span style="color:#D4D4D4;"> == </span><span style="color:#9CDCFE;">SaveKind</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">Update</span><span style="color:#D4D4D4;"> &amp;&amp; </span><span style="color:#9CDCFE;">oldItem</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">OwnerId</span><span style="color:#D4D4D4;"> != </span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">OwnerId</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">            </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#CE9178;">&quot;The owner of a case may not be changed&quot;</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#6A9955;">// This is a new item, OR its an existing item and the owner isn&#39;t being modified.</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">if</span><span style="color:#D4D4D4;"> (</span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">CreatedById</span><span style="color:#D4D4D4;"> != </span><span style="color:#9CDCFE;">User</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">GetUserId</span><span style="color:#D4D4D4;">())</span></span>
<span class="line"><span style="color:#D4D4D4;">            </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#CE9178;">&quot;You are not the owner of this item.&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#9CDCFE;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">true</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">override</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">ItemResult</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">BeforeDelete</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">Case</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">) </span></span>
<span class="line"><span style="color:#D4D4D4;">        =&gt; </span><span style="color:#9CDCFE;">User</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">IsInRole</span><span style="color:#D4D4D4;">(</span><span style="color:#CE9178;">&quot;Manager&quot;</span><span style="color:#D4D4D4;">) ? </span><span style="color:#569CD6;">true</span><span style="color:#D4D4D4;"> : </span><span style="color:#CE9178;">&quot;Unauthorized&quot;</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">override</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">Task</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">ExecuteDeleteAsync</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">Case</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#6A9955;">// Soft delete the item.</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#9CDCFE;">item</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">IsDeleted</span><span style="color:#D4D4D4;"> = </span><span style="color:#569CD6;">true</span><span style="color:#D4D4D4;">;</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#C586C0;">return</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">Db</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">SaveChangesAsync</span><span style="color:#D4D4D4;">();</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="dependency-injection" tabindex="-1"><a class="header-anchor" href="#dependency-injection" aria-hidden="true">#</a> Dependency Injection</h3><p>All behaviors are instantiated using dependency injection and your application&#39;s <code>IServiceProvider</code>. As a result, you can add whatever constructor parameters you desire to your behaviors as long as a value for them can be resolved from your application&#39;s services. The single parameter to the <code>StandardBehaviors</code> is resolved in this way - the <code>CrudContext&lt;TContext&gt;</code> contains the common set of objects most commonly used, including the <code>DbContext</code> and the <code>ClaimsPrincipal</code> representing the current user.</p><h2 id="standard-behaviors" tabindex="-1"><a class="header-anchor" href="#standard-behaviors" aria-hidden="true">#</a> Standard Behaviors</h2><p>The standard behaviors, <code>IntelliTect.Coalesce.StandardBehaviors&lt;T&gt;</code> and its EntityFramework-supporting sibling <code>IntelliTect.Coalesce.StandardBehaviors&lt;T, TContext&gt;</code>, contain a significant number of properties and methods that can be utilized and/or overridden at your leisure.</p><h3 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h3>`,7),P=e("p",null,"The object passed to the constructor that contains the set of objects needed by the standard behaviors, and those that are most likely to be used in custom implementations.",-1),q=e("p",null,[s("An instance of the db context that contains a "),e("code",null,"DbSet<T>"),s(" for the entity handled by the behaviors")],-1),M=e("p",null,"The user making the current request.",-1),K=e("p",null,"A data source that, if set, will override the data source that is used to retrieve the target of an update operation from the database. The incoming values will then be set on this retrieved object. Null by default; override by setting a value in the constructor.",-1),G=e("p",null,"A data source that, if set, will override the data source that is used to retrieve a newly-created or just-updated object from the database after a save. The retrieved object will be returned to the client. Null by default; override by setting a value in the constructor.",-1),N=e("p",null,"A data source that, if set, will override the data source that is used to retrieve the target of an delete operation from the database. The retrieved object will then be deleted. Null by default; override by setting a value in the constructor.",-1),U=i(`<p>A data source that, if set, will override the data source that is used to retrieve the target of an delete operation from the database after it has been deleted. If an object is able to be retrieved from this data source, it will be sent back to the client. This allows soft-deleted items to be returned to the client when the user is able to see them. Null by default; override by setting a value in the constructor.</p><h3 id="method-overview" tabindex="-1"><a class="header-anchor" href="#method-overview" aria-hidden="true">#</a> Method Overview</h3><p>The standard behaviors implementation contains many different methods which can be overridden in your derived class to control functionality.</p><p>These methods often call one another, so overriding one method may cause some other method to no longer be called. The hierarchy of method calls, ignoring any logic or conditions contained within, is as follows:</p><div class="language-text ext-text"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#D4D4D4;">SaveAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">    DetermineSaveKindAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">    GetDbSet</span></span>
<span class="line"><span style="color:#D4D4D4;">    ValidateDto</span></span>
<span class="line"><span style="color:#D4D4D4;">    MapIncomingDto</span></span>
<span class="line"><span style="color:#D4D4D4;">    BeforeSaveAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">        BeforeSave</span></span>
<span class="line"><span style="color:#D4D4D4;">    ExecuteSaveAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">    AfterSave</span></span>
<span class="line"><span style="color:#D4D4D4;"></span></span>
<span class="line"><span style="color:#D4D4D4;">DeleteAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">    BeforeDeleteAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">        BeforeDelete</span></span>
<span class="line"><span style="color:#D4D4D4;">    ExecuteDeleteAsync</span></span>
<span class="line"><span style="color:#D4D4D4;">        GetDbSet</span></span>
<span class="line"><span style="color:#D4D4D4;">    AfterDelete</span></span>
<span class="line"><span style="color:#D4D4D4;"></span></span></code></pre></div><h3 id="method-details" tabindex="-1"><a class="header-anchor" href="#method-details" aria-hidden="true">#</a> Method Details</h3><p>All of the methods outlined above can be overridden. A description of each of the methods is as follows:</p>`,7),V=e("p",null,[s("Save the given item. This is the main entry point for saving, and takes a DTO as a parameter. This method is responsible for performing mapping to your EF models and ultimately saving to your database. If it is required that you access properties from the incoming DTO in this method, a set of extension methods "),e("code",null,"GetValue"),s(" and "),e("code",null,"GetObject"),s(" are available on the DTO for accessing properties that are mapped 1:1 with your EF models.")],-1),Y=e("p",null,"Given the incoming DTO on which Save has been called, examine its properties to determine if the operation is meant to be a create or an update operation. Return this distinction along with the key that was used to make the distinction.",-1),z=e("p",null,"This method is called outside of the standard data source by the base API controller to perform role-based security on saves at the controller level.",-1),L=e("p",null,[s("Returns a "),e("code",null,"DbSet<T>"),s(" that items can be added to (creates) or remove from (deletes).")],-1),W=s("Provides a chance to validate the properties of the DTO object itself, as opposed to the properties of the model after the DTO has been mapped to it in "),H=e("code",null,"BeforeSave",-1),J=s(". A number of extension methods on "),Q=e("code",null,"IClassDto<T>",-1),X=s(" can be used to access the value of the properties of "),Z=s("Generated C# DTOs"),$=s(". For behaviors on "),ee=s("Custom DTOs"),se=s(" where the DTO type is known, simply cast to the correct type."),ae=e("p",null,[s("Map the properties of the incoming DTO to the model that will be saved to the database. By default, this will call the "),e("code",null,"MapTo"),s(" method on the DTO, but if more precise control is needed, the "),e("code",null,"IClassDto<T>"),s(" extension methods or a cast to a known type can be used to get specific values. If all else fails, the DTO can be reflected upon.")],-1),ne=e("p",null,"Provides an easy way for derived classes to intercept a save attempt and either reject it by returning an unsuccessful result, or approve it by returning success. The incoming item can also be modified at will in this method to override changes that the client made as desired.",-1),te=s("Provides an easy way for derived classes to perform actions after a save operation has been completed. Failure results returned here will present an error to the client, but will not prevent modifications to the database since changes have already been saved at this point. This method can optionally modify or replace the item that is sent back to the client after a save by setting "),oe=e("code",null,"ref T item",-1),le=s(" to another object or to null. Setting "),re=e("code",null,"ref IncludeTree includeTree",-1),ie=s(" will override the "),pe=s("Include Tree"),ce=s(" used to shape the response object."),de=e("div",{class:"custom-container warning"},[e("p",{class:"custom-container-title"},"WARNING"),e("p",null,[s("Setting "),e("code",null,"ref T item"),s(" to null will prevent the new object from being returned - be aware that this can be harmful in create scenarios since it prevents the client from receiving the primary key of the newly created item. If autoSave is enabled on the client, this could cause a large number of duplicate objects to be created in the database, since each subsequent save by the client will be treated as a create when the incoming object lacks a primary key.")])],-1),De=e("p",null,"Deletes the given item.",-1),he=e("p",null,"Provides an easy way to intercept a delete request and potentially reject it (by returning a non-success ItemResult).",-1),ye=e("p",null,[s("Performs the delete action against the database. The implementation of this method removes the item from its corresponding "),e("code",null,"DbSet<T>"),s(", and then calls "),e("code",null,"Db.SaveChangesAsync()"),s(".")],-1),ue=e("p",null,"Overriding this allows for changing this row-deletion implementation to something else, like setting of a soft delete flag, or copying the data into another archival table before deleting.",-1),ve=s("Allows for performing any sort of cleanup actions after a delete has completed. If the item was still able to be retrieved from the database after the delete operation completed, this method allows lets you modify or replace the item that is sent back to the client by setting "),me=e("code",null,"ref T item",-1),be=s(" to another object or to null. Setting "),Ce=e("code",null,"ref IncludeTree includeTree",-1),fe=s(" will override the "),_e=s("Include Tree"),ge=s(" used to shape the response object."),Te=i(`<h2 id="globally-replacing-the-standard-behaviors" tabindex="-1"><a class="header-anchor" href="#globally-replacing-the-standard-behaviors" aria-hidden="true">#</a> Globally Replacing the Standard Behaviors</h2><p>You can, of course, create a custom base behaviors class that all your custom implementations inherit from. But, what if you want to override the standard behaviors across your entire application, so that <code>StandardBehaviors&lt;,&gt;</code> will never be instantiated? You can do that too!</p><p>Simply create a class that implements <code>IEntityFrameworkBehaviors&lt;,&gt;</code> (the <code>StandardBehaviors&lt;,&gt;</code> already does - feel free to inherit from it), then register it at application startup like so:</p><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">MyBehaviors</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">T</span><span style="color:#D4D4D4;">, </span><span style="color:#4EC9B0;">TContext</span><span style="color:#D4D4D4;">&gt; : </span><span style="color:#4EC9B0;">StandardBehaviors</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">T</span><span style="color:#D4D4D4;">, </span><span style="color:#4EC9B0;">TContext</span><span style="color:#D4D4D4;">&gt;</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">where</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">T</span><span style="color:#D4D4D4;"> : </span><span style="color:#569CD6;">class</span><span style="color:#D4D4D4;">, </span><span style="color:#569CD6;">new</span><span style="color:#D4D4D4;">()</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">where</span><span style="color:#D4D4D4;"> </span><span style="color:#4EC9B0;">TContext</span><span style="color:#D4D4D4;"> : </span><span style="color:#4EC9B0;">DbContext</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">MyBehaviors</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">CrudContext</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">TContext</span><span style="color:#D4D4D4;">&gt; </span><span style="color:#9CDCFE;">context</span><span style="color:#D4D4D4;">) : </span><span style="color:#569CD6;">base</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">context</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D4D4D4;">    ...</span></span>
<span class="line"><span style="color:#D4D4D4;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-c# ext-c# line-numbers-mode"><pre class="shiki" style="background-color:#1E1E1E;"><code><span class="line"><span style="color:#569CD6;">public</span><span style="color:#D4D4D4;"> </span><span style="color:#569CD6;">void</span><span style="color:#D4D4D4;"> </span><span style="color:#DCDCAA;">ConfigureServices</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">IServiceCollection</span><span style="color:#D4D4D4;"> </span><span style="color:#9CDCFE;">services</span><span style="color:#D4D4D4;">)</span></span>
<span class="line"><span style="color:#D4D4D4;">{</span></span>
<span class="line"><span style="color:#D4D4D4;">    </span><span style="color:#9CDCFE;">services</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">AddCoalesce</span><span style="color:#D4D4D4;">(</span><span style="color:#9CDCFE;">b</span><span style="color:#D4D4D4;"> =&gt;</span></span>
<span class="line"><span style="color:#D4D4D4;">    {</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#9CDCFE;">b</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">AddContext</span><span style="color:#D4D4D4;">&lt;</span><span style="color:#4EC9B0;">AppDbContext</span><span style="color:#D4D4D4;">&gt;();</span></span>
<span class="line"><span style="color:#D4D4D4;">        </span><span style="color:#9CDCFE;">b</span><span style="color:#D4D4D4;">.</span><span style="color:#DCDCAA;">UseDefaultBehaviors</span><span style="color:#D4D4D4;">(</span><span style="color:#569CD6;">typeof</span><span style="color:#D4D4D4;">(</span><span style="color:#4EC9B0;">MyBehaviors</span><span style="color:#D4D4D4;">&lt;,&gt;));</span></span>
<span class="line"><span style="color:#D4D4D4;">    });</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Your custom behaviors class must have the same generic type parameters - <code>&lt;T, TContext&gt;</code>. Otherwise, the Microsoft.Extensions.DependencyInjection service provider won&#39;t know how to inject it.</p>`,6);function Ee(we,Ie){const l=r("RouterLink"),o=r("router-link"),n=r("Prop");return c(),d("div",null,[h,y,u,e("p",null,[v,a(l,{to:"/modeling/model-components/data-sources.html"},{default:t(()=>[m]),_:1}),b]),C,e("nav",f,[e("ul",null,[e("li",null,[a(o,{to:"#defining-behaviors"},{default:t(()=>[_]),_:1}),e("ul",null,[e("li",null,[a(o,{to:"#dependency-injection"},{default:t(()=>[g]),_:1})])])]),e("li",null,[a(o,{to:"#standard-behaviors"},{default:t(()=>[T]),_:1}),e("ul",null,[e("li",null,[a(o,{to:"#properties"},{default:t(()=>[E]),_:1})]),e("li",null,[a(o,{to:"#method-overview"},{default:t(()=>[w]),_:1})]),e("li",null,[a(o,{to:"#method-details"},{default:t(()=>[I]),_:1})])])]),e("li",null,[a(o,{to:"#globally-replacing-the-standard-behaviors"},{default:t(()=>[S]),_:1})])])]),A,B,e("div",x,[k,e("p",null,[F,a(l,{to:"/modeling/model-components/methods.html"},{default:t(()=>[j]),_:1}),O])]),R,a(n,{def:"CrudContext<TContext> Context"}),P,a(n,{def:"TContext Db"}),q,a(n,{def:"ClaimsPrincipal User"}),M,a(n,{def:"IDataSource<T> OverrideFetchForUpdateDataSource"}),K,a(n,{def:"IDataSource<T> OverridePostSaveResultDataSource"}),G,a(n,{def:"IDataSource<T> OverrideFetchForDeleteDataSource"}),N,a(n,{def:"IDataSource<T> OverridePostDeleteResultDataSource"}),U,a(n,{def:"Task<ItemResult<TDto?>> SaveAsync<TDto>(TDto incomingDto, IDataSource<T> dataSource, IDataSourceParameters parameters)"}),V,a(n,{def:"Task<(SaveKind Kind, object? IncomingKey)> DetermineSaveKindAsync<TDto>(TDto incomingDto, IDataSource<T> dataSource, IDataSourceParameters parameters)"}),Y,z,a(n,{def:"DbSet<T> GetDbSet()"}),L,a(n,{def:"ItemResult ValidateDto(SaveKind kind, IClassDto<T> dto)"}),e("p",null,[W,H,J,Q,X,a(l,{to:"/stacks/agnostic/dtos.html"},{default:t(()=>[Z]),_:1}),$,a(l,{to:"/modeling/model-types/dtos.html"},{default:t(()=>[ee]),_:1}),se]),a(n,{def:"void MapIncomingDto<TDto>(SaveKind kind, T item, TDto dto, IDataSourceParameters parameters)"}),ae,a(n,{def:`Task<ItemResult> BeforeSaveAsync(SaveKind kind, T? oldItem, T item);
ItemResult BeforeSave(SaveKind kind, T? oldItem, T item)`}),ne,a(n,{def:"ItemResult AfterSave(SaveKind kind, T? oldItem, ref T item, ref IncludeTree? includeTree)"}),e("p",null,[te,oe,le,re,ie,a(l,{to:"/concepts/include-tree.html"},{default:t(()=>[pe]),_:1}),ce]),de,a(n,{def:"Task<ItemResult<TDto?>> DeleteAsync<TDto>(object id, IDataSource<T> dataSource, IDataSourceParameters parameters)"}),De,a(n,{def:`Task<ItemResult> BeforeDeleteAsync(T item);
ItemResult BeforeDelete(T item)`}),he,a(n,{def:"Task ExecuteDeleteAsync(T item)"}),ye,ue,a(n,{def:"void AfterDelete(ref T item, ref IncludeTree? includeTree)"}),e("p",null,[ve,me,be,Ce,fe,a(l,{to:"/concepts/include-tree.html"},{default:t(()=>[_e]),_:1}),ge]),Te])}const Ae=p(D,[["render",Ee],["__file","behaviors.html.vue"]]);export{Ae as default};
