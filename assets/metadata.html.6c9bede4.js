import{_ as c,r as s,o as h,c as p,b as e,d as a,w as o,e as t,a as r}from"./app.83c59791.js";const u={},m=e("h1",{id:"metadata-layer",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#metadata-layer","aria-hidden":"true"},"#"),t(" Metadata Layer")],-1),_=e("p",null,[t("The metadata layer, generated as "),e("code",null,"metadata.g.ts"),t(", contains a minimal set of metadata to represent your data model on the front-end. Because Vue applications are typically statically compiled, it is necessary for the frontend code to have a representation of your data model as an analog to the "),e("code",null,"ReflectionRepository"),t(" available at runtime to Knockout apps that utilize "),e("code",null,".cshtml"),t(" files.")],-1),f={class:"table-of-contents"},y=t("Concepts"),v=t("Metadata"),b=t("Type"),g=t("Value"),x=t("Property"),T=t("Domain"),k=e("h2",{id:"concepts",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#concepts","aria-hidden":"true"},"#"),t(" Concepts")],-1),C=t("The following is a non-exhaustive list of the general concepts used by the metadata layer. The "),w={href:"https://github.com/IntelliTect/Coalesce/blob/dev/src/coalesce-vue/src/metadata.ts",target:"_blank",rel:"noopener noreferrer"},V=t("source code of coalesce-vue"),N=t(" provides the most exhaustive set of documentation about the metadata layer:"),E=e("h3",{id:"metadata",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#metadata","aria-hidden":"true"},"#"),t(" Metadata")],-1),P=e("p",null,[t("All objects in the metadata layer that represent any kind of metadata have, at the very least, a "),e("code",null,"name"),t(", the name of the metadata element in code (type names, property names, parameter names, etc). and a "),e("code",null,"displayName"),t(", the human-readable form of the name that is suitable for presentation when needed. Names follow the casing convention of their corresponding language elements - types are PascalCased, while other things like properties, methods, and parameters are camelCased.")],-1),R=e("h3",{id:"type",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#type","aria-hidden":"true"},"#"),t(" Type")],-1),j=t("All custom types exposed by your application's data model will have a Type metadata object generated. This includes both C# classes, and C# enums. Class types include "),D=e("code",null,"model",-1),L=t(" (for "),A=t("Entity Models"),B=t(" and "),I=t("Custom DTOs"),M=t(") and "),K=e("code",null,"object",-1),S=t(" (for "),z=t("External Types"),F=t(")."),J=e("h3",{id:"value",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#value","aria-hidden":"true"},"#"),t(" Value")],-1),O=e("p",null,"In the metadata layer, a Value is the usage of a type. This could be any type - strings, numbers, enums, classes, or even void. Values can be found in the collection of an object's properties, a method's parameters or return value, or as a data source's parameters.",-1),q=e("p",null,"All values have the following properties:",-1),G=r("<p>Type could be a language primitive like <code>string</code> or <code>number</code>, a non-primitive JavaScript type (<code>date</code>, <code>file</code>), or in the case of a custom Type, the type kind of that type (<code>model</code>, <code>enum</code>, <code>object</code>). For custom types, an additional property <code>typeDef</code> will refer to the Type metadata for that type.</p>",1),H=r('<p>Role represents what purpose the value serves in a relational model. Either <code>value</code> (the default - no relational role), <code>primaryKey</code>, <code>foreignKey</code>, <code>referenceNavigation</code>, or <code>collectionNavigation</code>.</p><h3 id="property" tabindex="-1"><a class="header-anchor" href="#property" aria-hidden="true">#</a> Property</h3><p>A Property is a more refined Value that contains a number of additional fields based on the <code>role</code> of the property. k</p><h3 id="domain" tabindex="-1"><a class="header-anchor" href="#domain" aria-hidden="true">#</a> Domain</h3><p>The type of the default export of the generated metadata. Serves as a single root from which all other metadata can be accessed. Contains fields <code>types</code>, <code>enums</code>, and <code>services</code> as organizing structures for the different kinds of custom types.</p>',5);function Q(U,W){const n=s("router-link"),i=s("ExternalLinkIcon"),d=s("RouterLink"),l=s("Prop");return h(),p("div",null,[m,_,e("nav",f,[e("ul",null,[e("li",null,[a(n,{to:"#concepts"},{default:o(()=>[y]),_:1}),e("ul",null,[e("li",null,[a(n,{to:"#metadata"},{default:o(()=>[v]),_:1})]),e("li",null,[a(n,{to:"#type"},{default:o(()=>[b]),_:1})]),e("li",null,[a(n,{to:"#value"},{default:o(()=>[g]),_:1})]),e("li",null,[a(n,{to:"#property"},{default:o(()=>[x]),_:1})]),e("li",null,[a(n,{to:"#domain"},{default:o(()=>[T]),_:1})])])])])]),k,e("p",null,[C,e("a",w,[V,a(i)]),N]),E,P,R,e("p",null,[j,D,L,a(d,{to:"/modeling/model-types/entities.html"},{default:o(()=>[A]),_:1}),B,a(d,{to:"/modeling/model-types/dtos.html"},{default:o(()=>[I]),_:1}),M,K,S,a(d,{to:"/modeling/model-types/external-types.html"},{default:o(()=>[z]),_:1}),F]),J,O,q,a(l,{def:"type: TypeDiscriminator",lang:"ts"}),G,a(l,{def:"role: ValueRole",lang:"ts"}),H])}const Y=c(u,[["render",Q],["__file","metadata.html.vue"]]);export{Y as default};
