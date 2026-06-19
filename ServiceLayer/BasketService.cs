using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Exceptions;
using DomainLayre.Models;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace ServiceLayer
{
    public class BasketService(IBasketRepository _repository,IMapper _mapper) : IBasketService
    {
        public async Task<BasketDto> CreateOrUpdateBasket(BasketDto basket)
        {
            var mapbasket = _mapper.Map<BasketDto, CustomerBasket>(basket);
            var result =await _repository.CreateOrUpdateBasket(mapbasket);
            if(result != null) 
                return await GetBasketAsync(result.Id);
            else              
                throw new Exception("Error creating or updating the basket");
        }

        public async Task<bool> DeleteBasketAsync(string key)
        {
            return await _repository.DeleteBasketAsync(key);
        }

        public async Task<BasketDto> GetBasketAsync(string key)
        {
           var basket= await _repository.GetBasketAsync(key);
            if (basket == null)
                throw new BasketNotFoundException(key);
            var mapbasket= _mapper.Map<CustomerBasket,BasketDto>(basket);
            return mapbasket;

        }
    }
}
