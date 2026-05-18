using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Models;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace ServiceLayer
{
    public class ProductService(IUnitOfWorke _unitOfWorke,IMapper _mapper) : IProductService
    {
        public async Task<IEnumerable<BrandDto>> GetAllBrandAsync()
        {
            var brands =await _unitOfWorke.GetRepository<Product_Brand,int>().GetAllAsync();

                return _mapper.Map<IEnumerable<Product_Brand>,IEnumerable<BrandDto>>(brands);
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _unitOfWorke.GetRepository<Product,int>().GetAllAsync();
                return _mapper.Map<IEnumerable<Product>,IEnumerable<ProductDto>>(products);
        }

        public async Task<IEnumerable<TyepDto>> GetAllTyepAsync()
        {
            
            var types =await _unitOfWorke.GetRepository<Product_Type,int>().GetAllAsync();
            
                return _mapper.Map<IEnumerable<Product_Type>,IEnumerable<TyepDto>>(types);
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product =await _unitOfWorke.GetRepository<Product,int>().GetByIdAsync(id);

                return _mapper.Map<Product?,ProductDto?>(product);

        }
    }
}
