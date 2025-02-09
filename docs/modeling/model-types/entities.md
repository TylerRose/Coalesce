# EF Entity Models

Models are the core business objects of your application - they serve as the fundamental representation of data in your application. The design of your models is very important. In [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) (EF), data models are just Plain Old CLR Objects (POCOs).

## Building a Data Model

To start building your data model that Coalesce will generate code for, follow the best practices for [EF Core](https://docs.microsoft.com/en-us/ef/core/). Guidance on this topic is available in abundance in the [Entity Framework Core documentation](https://docs.microsoft.com/en-us/ef/core/).

Don't worry about querying or saving data when you're just getting started - Coalesce will provide a lot of that functionality for you, and it is very easy to customize what Coalesce offers later. To get started, just build your entity classes and `DbContext` class. Annotate your `DbContext` class with `[Coalesce]` so that Coalesce will discover it and generate code based off of your context for you. Also ensure that each entity model has a `DbSet` property on the context - this is how Coalesce discovers your entity model types.

Before you start building, you are highly encouraged to read the sections below. The linked pages explain in greater detail what Coalesce will build for you for each part of your data model.

### Properties

Read [Properties](/modeling/model-components/properties.md) for an outline of the different types of properties that you may place on your models and the code that Coalesce will generate for each of them.


### Attributes

Coalesce provides a number of C# attributes that can be used to decorate your model classes and their properties in order to customize behavior, appearance, security, and more. Coalesce also supports a number of annotations from `System.ComponentModel.DataAnnotations`.

Read [Attributes](/modeling/model-components/attributes.md) to learn more.


### Methods

You can place both static and interface methods on your model classes. Any public methods annotated with [[Coalesce]](/modeling/model-components/attributes/coalesce.md) will have a generated API endpoint and corresponding generated TypeScript members for calling this API endpoint. Read [Methods](/modeling/model-components/methods.md) to learn more.


## Customizing CRUD Operations

Once you've got a solid data model in place, its time to start customizing the way that Coalesce will *read* your data, as well as the way that it will handle your data when processing *creates*, *updates*, and *deletes*.

### Data Sources

The method by which you can control what data the users of your application can access through Coalesce's generated APIs is by creating custom data sources. These are classes that allow complete control over the way that data is retrieved from your database and provided to clients. Read [Data Sources](/modeling/model-components/data-sources.md) to learn more.

### Behaviors

Behaviors in Coalesce are to mutating data as data sources are to reading data. Defining a behaviors class for a model allows complete control over the way that Coalesce will create, update, and delete your application's data in response to requests made through its generated API. Read [Behaviors](/modeling/model-components/behaviors.md) to learn more.

