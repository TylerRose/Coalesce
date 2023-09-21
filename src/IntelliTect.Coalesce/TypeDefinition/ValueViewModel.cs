﻿using IntelliTect.Coalesce.DataAnnotations;
using IntelliTect.Coalesce.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IntelliTect.Coalesce.TypeDefinition
{
    public abstract class ValueViewModel : IAttributeProvider
    {
        protected ValueViewModel(TypeViewModel type)
        {
            Type = type;
        }

        public abstract string Name { get; }

        /// <summary>
        /// Returns the DisplayName Attribute or 
        /// puts a space before every upper class letter aside from the first one.
        /// </summary>
        public virtual string DisplayName =>
            this.GetAttributeValue<DisplayNameAttribute>(a => a.DisplayName) ??
            this.GetAttributeValue<DisplayAttribute>(a => a.Name) ??
            Name.ToProperCase();

        /// <summary>
        /// Returns the description from the DisplayAttribute, if present.
        /// </summary>
        public virtual string? Description => this.GetAttributeValue<DisplayAttribute>(a => a.Description);

        public string JsVariable => Name.ToCamelCase();

        /// <summary>
        /// Gets the raw, unaltered type of the value.
        /// </summary>
        public TypeViewModel Type { get; init; }

        /// <summary>
        /// Gets the type without any collection around it.
        /// </summary>
        public TypeViewModel PureType => Type.PureType;

        /// <summary>
        /// True if the value should generate a "required" validation rule.
        /// </summary>
        public virtual bool IsRequired
        {
            get
            {

                if (HasAttribute<RequiredAttribute>()) return true;

                if (
                    Type.IsNumber &&
                    !Type.IsNullableValueType &&
                    Range is var range and not null && (
                        Convert.ToDecimal(range.Item1) > 0 ||
                        Convert.ToDecimal(range.Item2) < 0
                    )
                )
                {
                    // Value is a non-nullable number with a [RangeAttribute] that excludes zero.
                    // Coalesce does not implicitly require non-nullable value types - it allows them to stay as their default value.

                    // Normally, our validation would allow this to fall onto its default value if
                    // not provided by the client to a generated DTO (since RangeAttribute ignores null
                    // and the property on the DTO is null if the value is missing). But, that's clearly 
                    // not user intent if they excluded zero from the valid range.

                    // So, add an implicit required in this case.
                    return true;
                }

                return false;
            }
        }

        /// <summary>
        /// Returns the range of valid values or null if they don't exist. (min, max)
        /// </summary>
        public Tuple<object, object>? Range
        {
            get
            {
                var min = GetAttributeValue<RangeAttribute>(nameof(RangeAttribute.Minimum));
                var max = GetAttributeValue<RangeAttribute>(nameof(RangeAttribute.Maximum));
                if (min != null && max != null) return new Tuple<object, object>(min, max);
                return null;
            }
        }

        public DateTypeAttribute.DateTypes? DateType =>
            this.GetAttributeValue<DateTypeAttribute, DateTypeAttribute.DateTypes>(a => a.DateType) ??
            (this.GetAttributeValue<DataTypeAttribute, DataType>(a => a.DataType) switch
            {
                DataType.Date => DateTypeAttribute.DateTypes.DateOnly,
                DataType.Time => DateTypeAttribute.DateTypes.TimeOnly,
                _ => (DateTypeAttribute.DateTypes?)null
            }) ?? Type.DateType;

        /// <summary>
        /// Returns the MinLength of the property or null if it doesn't exist.
        /// </summary>
        public int? MinLength => this.GetAttributeValue<MinLengthAttribute, int>(a => a.Length);

        /// <summary>
        /// Returns the MaxLength of the property or null if it doesn't exist.
        /// </summary>
        public int? MaxLength => this.GetAttributeValue<MaxLengthAttribute, int>(a => a.Length);

        public abstract object? GetAttributeValue<TAttribute>(string valueName) where TAttribute : Attribute;
        public abstract bool HasAttribute<TAttribute>() where TAttribute : Attribute;
    }
}
