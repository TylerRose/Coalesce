﻿using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using IntelliTect.Coalesce.Helpers;

namespace IntelliTect.Coalesce.TypeDefinition
{
    public class SymbolClassViewModel : ClassViewModel
    {
        protected ITypeSymbol Symbol { get; }

        public SymbolClassViewModel(INamedTypeSymbol symbol)
        {
            Symbol = symbol;
            Type = new SymbolTypeViewModel(Symbol);
        }

        public override string Name => Symbol.Name;

        public override string Comment => SymbolExtensions.ExtractXmlComments(Symbol);

        /// <summary>
        /// Recursive function to get the full namespace.
        /// </summary>
        /// <param name="ns"></param>
        /// <returns></returns>
        private string FullNamespace(INamespaceSymbol ns)
        {
            if (ns.ContainingNamespace != null && !string.IsNullOrWhiteSpace(ns.Name))
            {
                var rest = FullNamespace(ns.ContainingNamespace);
                if (!string.IsNullOrWhiteSpace(rest))
                {
                    return FullNamespace(ns.ContainingNamespace) + "." + ns.Name;
                }
                return ns.Name;
            }
            return "";
        }

        protected override ICollection<PropertyViewModel> RawProperties
        {
            get
            {
                var result = Symbol.GetMembers()
                    .Where(s => s.Kind == SymbolKind.Property)
                    .Cast<IPropertySymbol>()
                    .Select((s, i) => new SymbolPropertyViewModel(this, s) { ClassFieldOrder = i })
                    .Cast<PropertyViewModel>()
                    .ToList();

                // Add properties from the base class
                if (Symbol.BaseType != null && Symbol.BaseType.Name != "Object")
                {
                    var parentSymbol = new SymbolClassViewModel(Symbol.BaseType);
                    result.AddRange(parentSymbol.RawProperties);
                }
                return result;
            }
        }

        protected override ICollection<MethodViewModel> RawMethods
        {
            get
            {
                var result = Symbol.GetMembers()
                    .Where(f => f.Kind == SymbolKind.Method && f.DeclaredAccessibility == Accessibility.Public)
                    .Cast<IMethodSymbol>()
                    .Where(f => f.MethodKind == MethodKind.Ordinary)
                    .Select(s => new SymbolMethodViewModel(s, this))
                    .ToList();

                // Add methods from the base class
                if (Symbol.BaseType != null && Symbol.BaseType.Name != "Object")
                {
                    var parentSymbol = new SymbolClassViewModel(Symbol.BaseType);
                    result.AddRange(parentSymbol.Methods
                        .Cast<SymbolMethodViewModel>()
                        // Don't add overriden methods
                        .Where(baseMethod => !result.Any(method => method.Symbol.OverriddenMethod == baseMethod.Symbol)
                    ));
                }

                return result
                    .Cast<MethodViewModel>()
                    .ToList();
            }
        }

        protected override ICollection<TypeViewModel> RawNestedTypes => Symbol.GetTypeMembers()
            .Select(t => new SymbolTypeViewModel(t))
            .Cast<TypeViewModel>()
            .ToList();

        public override object GetAttributeValue<TAttribute>(string valueName) =>
            Symbol.GetAttributeValue<TAttribute>(valueName);

        public override bool HasAttribute<TAttribute>() =>
            Symbol.HasAttribute<TAttribute>();
    }
}