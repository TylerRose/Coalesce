import{_ as e,o as t,c as s,a}from"./app.83c59791.js";const n={},o=a(`<p>.. This page is very dated, so it has been excluded from the docs. Most of what it explains is handled by _SecurityAttributes anyway.</p><h1 id="security" tabindex="-1"><a class="header-anchor" href="#security" aria-hidden="true">#</a> Security</h1><h2 id="overview" tabindex="-1"><a class="header-anchor" href="#overview" aria-hidden="true">#</a> Overview</h2><p>Security is primarily handled through model annotations. These annotations can be added to classes, properties, and methods.</p><p>Coalesce uses the built in Microsoft framework for security and supports both Active Directory and Identity 3.</p><p>By default all views and APIs are marked with the [Authorize] attribute by default. To make them available to anonymous users, they must be annotated as such.</p><p>Internally these are implemented, when possible, with the MVC Authorize attribute. When this isn&#39;t possible, they are implemented in code and when serializing objects. For example, fields that are not readable to the user are not serialized into the API response.</p><h2 id="classes" tabindex="-1"><a class="header-anchor" href="#classes" aria-hidden="true">#</a> Classes</h2><p>Basic security is done at the class level. There are two attributes that can be used: Read and Edit. Both of these attributes take a Roles string argument which allows a comma delimited list of role names. They both also take an AllowAnonymous parameter, by default this is set to false. When set to true, it opens the item to anonymous access.</p><p>The Read and Edit attributes can be combined to only allow edits for certain users. Below is an example of how to allow read access to anyone and write access only for administrators.</p><pre><code>\`\`\` c#
    [Edit(Roles=&#39;Admin&#39;)] [Read(AllowAnonymous = true)]
    public class Person
    {
        public int PersonId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }


\`\`\`
</code></pre><p>Additionally the Edit attribute has an Allow property that can be set to false to disallow all edits. In fact this removes the API controller method for editing.</p><h2 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h2><p>Properties can be secured in the same way that classes are secured. An individual property can be secured for read and edit access by role. AllowAnonymous must be applied to the class. This opens all methods and must be secured if limited access to certain properties is desired.</p><p>The example below allows only admins to edit the last name. Additionally, only admins can read and consequently edit the gender.</p><pre><code>\`\`\` c#
    [Edit(Roles=&#39;Admin&#39;)] [Read(AllowAnonymous = true)]
    public class Person
    {
        public int PersonId { get; set; }
        public string FirstName { get; set; }
        [Edit(Roles=&quot;Admin&quot;)]
        public string LastName { get; set; }
        [Read(Roles=&quot;Admin&quot;)]
        public string Gender { get; set; }
    }


\`\`\`
</code></pre><h2 id="methods" tabindex="-1"><a class="header-anchor" href="#methods" aria-hidden="true">#</a> Methods</h2><p>Methods are secured via the [Execute] attribute. It also uses the Roles argument to specify the list of valid roles that can access the method.</p><p>The example below allows only admins to access the method.</p><pre><code>\`\`\` c#
    public class Person
    {
        public int PersonId { get; set; }
        
        [Execute(Roles=&quot;Admin&quot;)]
        public string Hello() {
            return &quot;Hello&quot;;
        }
    }


\`\`\`
</code></pre><h2 id="using-authorizeattribute" tabindex="-1"><a class="header-anchor" href="#using-authorizeattribute" aria-hidden="true">#</a> Using AuthorizeAttribute</h2><p>The code Coalesce generates doesn&#39;t rely on specifying roles or policies in the Authorize attribute. In .Net Core this would require additional work in Startup.cs to create policies</p><p>The example below maps the &quot;User&quot; role to an internal AD role name of AllUsers.</p><pre><code>\`\`\` c#
    RoleMapping.Add(&quot;User&quot;, &quot;AllUsers&quot;);  // Interactive user.


\`\`\`
</code></pre>`,24),i=[o];function r(d,l){return t(),s("div",null,i)}const h=e(n,[["render",r],["__file","security.html.vue"]]);export{h as default};
