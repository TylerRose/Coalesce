﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;

namespace IntelliTect.Coalesce.TypeDefinition
{
    internal class ReflectionTypeViewModel : TypeViewModel
    {
        protected internal Type Info { get; internal set; }

        public ReflectionTypeViewModel(Type type)
        {
            Info = type;
        }

        public override string Name => Info.Name.Replace("`1", "");

        public override object GetAttributeValue<TAttribute>(string valueName) =>
            Info.GetAttributeValue<TAttribute>(valueName);

        public override bool HasAttribute<TAttribute>() =>
            Info.HasAttribute<TAttribute>();

        public override bool IsA<T>() => IsA(typeof(T));

        public override TypeViewModel[] GenericArgumentsFor(Type type) => Info
            .GetInterfaces()
            .Single(i => i.IsGenericType && i.GetGenericTypeDefinition() == type)
            .GenericTypeArguments
            .Select(t => new ReflectionTypeViewModel(t))
            .ToArray();

        public override bool IsA(Type type) => Info.IsSubclassOf(type) || type.IsAssignableFrom(Info) || type == Info;

        public override bool IsGeneric => Info.IsGenericType;

        public override bool IsCollection => Info.GetInterface("IEnumerable") != null && !IsArray && !IsString;

        public override bool IsArray => Info.IsArray;

        public override bool IsNullable => Info.IsClass || IsNullableType;

        public override bool IsNullableType => Info.Name.Contains("Nullable");

        public override bool IsClass => Info.IsClass;

        public override Dictionary<int, string> EnumValues
        {
            get
            {
                var result = new Dictionary<int, string>();
                var info = Info;
                if (IsNullableType)
                {
                    info = Nullable.GetUnderlyingType(info);
                }
                foreach (var value in Enum.GetValues(info))
                {
                    result.Add((int)value, value.ToString());
                }
                return result;
            }
        }

        public override bool IsEnum => Info.IsEnum;

        public override string FullNamespace => Info.Namespace;

        private static string GetFriendlyTypeName(Type type)
        {
            // From https://stackoverflow.com/questions/401681

            if (type.IsGenericParameter)
            {
                return type.Name;
            }

            if (!type.IsGenericType)
            {
                return type.FullName;
            }

            var builder = new System.Text.StringBuilder();
            var name = type.Name;
            var index = name.IndexOf("`");
            builder.AppendFormat("{0}.{1}", type.Namespace, name.Substring(0, index));
            builder.Append('<');
            var first = true;
            foreach (var arg in type.GetGenericArguments())
            {
                if (!first)
                {
                    builder.Append(',');
                }
                builder.Append(GetFriendlyTypeName(arg));
                first = false;
            }
            builder.Append('>');
            return builder.ToString();
        }

        public override string FullyQualifiedName => GetFriendlyTypeName(Info);


        public override TypeViewModel FirstTypeArgument => 
            new ReflectionTypeViewModel(Info.GenericTypeArguments.First());

        public override TypeViewModel ArrayType => 
            new ReflectionTypeViewModel(Info.GetElementType());

        public override ClassViewModel ClassViewModel
        {
            get
            {
                if (!HasClassViewModel) return null;
                if (PureType != this) return PureType.ClassViewModel;
                if (Info != null) return ReflectionRepository.Global.GetClassViewModel(Info);
                return null;
            }
        }

        public override bool EqualsType(TypeViewModel b) => b is ReflectionTypeViewModel r ? Info == r.Info : false;
    }
}
