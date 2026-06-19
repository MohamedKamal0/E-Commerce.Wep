using AutoMapper;
using DomainLayre.Models.OrderModule;
using SheredLayer.DTOs;

namespace ServiceLayer.Mapping
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<AddressDto, OrderAddress>().ReverseMap();
            CreateMap<Order, OrderToReturn>()
                .ForMember(x => x.DeliveryMethod, o => o.MapFrom(s => s.DeliveryMethod.ShortName));

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(x => x.ProductName, o => o.MapFrom(s => s.Product.ProductName))
                .ForMember(x => x.PictureUrl, o => o.MapFrom<OrderItemPictureUrlResolver>());

            CreateMap<DeliveryMethod, DeliveryMethodDto>();

        }
    }
}
