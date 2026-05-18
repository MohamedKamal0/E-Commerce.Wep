using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DomainLayre.Models;
using SheredLayer.DTOs;

namespace ServiceLayer.Mapping
{
    public class ProductProfile:Profile
    {
        public ProductProfile()
            {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Product_Brand.Name))
            .ForMember(dest => dest.TypeName, opt => opt.MapFrom(src => src.Product_Type.Name));

                CreateMap<Product_Brand, BrandDto>();
                CreateMap<Product_Type, TyepDto>();
        }
    }
}
