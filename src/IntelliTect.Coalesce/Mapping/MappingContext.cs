﻿using IntelliTect.Coalesce.DataAnnotations;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace IntelliTect.Coalesce.Mapping
{
    public class MappingContext : IMappingContext
    {
        public ClaimsPrincipal User { get; }

        public string? Includes { get; }

        public IServiceProvider? Services { get; }

        private Dictionary<(object, IncludeTree?, Type), object> _mappedObjects { get; } = new();
        private Dictionary<string, bool>? _roleCache;
        private Dictionary<Type, IPropertyRestriction>? _restrictionCache;

        public MappingContext(
            ClaimsPrincipal? user = null, 
            string? includes = null,
            IServiceProvider? services = null
        )
        {
            User = user ?? new ClaimsPrincipal();
            Includes = includes;
            Services = services;
        }

        public MappingContext(CrudContext context, string? includes = null)
            : this(context.User, includes, context.ServiceProvider) { }

        public bool IsInRoleCached(string role)
        {
            _roleCache ??= new();
            if (_roleCache.TryGetValue(role, out bool inRole)) return inRole;

            return _roleCache[role] = User?.IsInRole(role) ?? false;
        }

        public void AddMapping(object sourceObject, IncludeTree? includeTree, object mappedObject)
        {
            _mappedObjects[(sourceObject, includeTree, mappedObject.GetType())] = mappedObject;
        }

        public bool TryGetMapping<TDto>(
            object sourceObject,
            IncludeTree? includeTree,
            [System.Diagnostics.CodeAnalysis.NotNullWhen(true)]
            out TDto? mappedObject
        )
            where TDto : class
        {
            if (!_mappedObjects.TryGetValue((sourceObject, includeTree, typeof(TDto)), out object? existingMapped))
            {
                mappedObject = default;
                return false; 
            }
            mappedObject = (TDto)existingMapped;
            return true;
        }

        public IPropertyRestriction GetPropertyRestriction(Type type)
        {
            _restrictionCache ??= new();
            if (_restrictionCache.TryGetValue(type, out var restriction)) return restriction;

            restriction = Services is {} 
                ? (IPropertyRestriction)ActivatorUtilities.GetServiceOrCreateInstance(Services, type) 
                : (IPropertyRestriction)Activator.CreateInstance(type)!;

            _restrictionCache.Add(type, restriction);

            return restriction;
        }
    }
}
