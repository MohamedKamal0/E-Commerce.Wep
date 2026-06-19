using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IBasketService
    {
        Task<BasketDto> GetBasketAsync(string key);
        Task<BasketDto>CreateOrUpdateBasket(BasketDto basket);
        Task<bool> DeleteBasketAsync(string key);
    }
}
