using AutoMapper;
using DomainLayre;
using DomainLayre.Models;
using SheredLayer.DTOs;

namespace ServiceLayer.Mapping
{
    public class ProductProfile : Profile
    {
        public ProductProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Product_Brand.Name))
                .ForMember(dest => dest.TypeName, opt => opt.MapFrom(src => src.Product_Type.Name))
                .ForMember(dest => dest.PictureUrls, opt => opt.MapFrom(src =>
                    src.Images.OrderBy(i => i.DisplayOrder).Select(i => i.PictureUrl).ToList()))
                .ForMember(dest => dest.PictureUrl, opt => opt.MapFrom(src => src.GetPrimaryPictureUrl()));

            CreateMap<ProductCreateDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Product_Brand, opt => opt.Ignore())
                .ForMember(dest => dest.Product_Type, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<Product_Brand, BrandDto>();
            CreateMap<Product_Type, TyepDto>();
        }
    }
}
