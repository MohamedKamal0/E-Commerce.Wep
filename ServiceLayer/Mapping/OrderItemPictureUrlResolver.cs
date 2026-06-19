using AutoMapper;
using DomainLayre.Models.OrderModule;
using Microsoft.Extensions.Configuration;
using SheredLayer.DTOs;

namespace ServiceLayer.Mapping
{
    public class OrderItemPictureUrlResolver : IValueResolver<OrderItem, OrderItemDto, string>
    {
        private readonly IConfiguration _config;
        public OrderItemPictureUrlResolver(IConfiguration config)
        {
            _config = config;
        }
        public string Resolve(OrderItem source, OrderItemDto destination, string destMember, ResolutionContext context)
        {
            if (string.IsNullOrEmpty(source.Product.PictureUrl))
                return string.Empty;

            var Url = $"{_config.GetSection("Urls")["BaseUrl"]}{source.Product.PictureUrl}";
            return Url;
        }

    }
}
