using IntelliTect.Coalesce;
using IntelliTect.Coalesce.Mapping;
using IntelliTect.Coalesce.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Coalesce.Web.Vue3.Models
{
    public partial class ProductDetailsParameter : GeneratedParameterDto<Coalesce.Domain.ProductDetails>
    {
        public ProductDetailsParameter() { }

        private Coalesce.Web.Vue3.Models.StreetAddressParameter _ManufacturingAddress;
        private Coalesce.Web.Vue3.Models.StreetAddressParameter _CompanyHqAddress;

        public Coalesce.Web.Vue3.Models.StreetAddressParameter ManufacturingAddress
        {
            get => _ManufacturingAddress;
            set { _ManufacturingAddress = value; Changed(nameof(ManufacturingAddress)); }
        }
        public Coalesce.Web.Vue3.Models.StreetAddressParameter CompanyHqAddress
        {
            get => _CompanyHqAddress;
            set { _CompanyHqAddress = value; Changed(nameof(CompanyHqAddress)); }
        }

        /// <summary>
        /// Map from the current DTO instance to the domain object.
        /// </summary>
        public override void MapTo(Coalesce.Domain.ProductDetails entity, IMappingContext context)
        {
            var includes = context.Includes;

            if (OnUpdate(entity, context)) return;

            if (ShouldMapTo(nameof(ManufacturingAddress))) entity.ManufacturingAddress = ManufacturingAddress?.MapToModelOrNew(entity.ManufacturingAddress, context);
            if (ShouldMapTo(nameof(CompanyHqAddress))) entity.CompanyHqAddress = CompanyHqAddress?.MapToModelOrNew(entity.CompanyHqAddress, context);
        }

        /// <summary>
        /// Map from the current DTO instance to a new instance of the domain object.
        /// </summary>
        public override Coalesce.Domain.ProductDetails MapToNew(IMappingContext context)
        {
            var entity = new Coalesce.Domain.ProductDetails();
            MapTo(entity, context);
            return entity;
        }
    }

    public partial class ProductDetailsResponse : GeneratedResponseDto<Coalesce.Domain.ProductDetails>
    {
        public ProductDetailsResponse() { }

        public Coalesce.Web.Vue3.Models.StreetAddressResponse ManufacturingAddress { get; set; }
        public Coalesce.Web.Vue3.Models.StreetAddressResponse CompanyHqAddress { get; set; }

        /// <summary>
        /// Map from the domain object to the properties of the current DTO instance.
        /// </summary>
        public override void MapFrom(Coalesce.Domain.ProductDetails obj, IMappingContext context, IncludeTree tree = null)
        {
            if (obj == null) return;
            var includes = context.Includes;


            this.ManufacturingAddress = obj.ManufacturingAddress.MapToDto<Coalesce.Domain.StreetAddress, StreetAddressResponse>(context, tree?[nameof(this.ManufacturingAddress)]);


            this.CompanyHqAddress = obj.CompanyHqAddress.MapToDto<Coalesce.Domain.StreetAddress, StreetAddressResponse>(context, tree?[nameof(this.CompanyHqAddress)]);

        }
    }
}
