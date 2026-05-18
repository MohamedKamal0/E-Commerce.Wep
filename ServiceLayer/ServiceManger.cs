using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DomainLayre.Contracts;
using ServiceLayerAbstraction;

namespace ServiceLayer
{
    public class ServiceManger(IUnitOfWorke _unitOfWorke,IMapper _mapper) : IServiceManger
    {
        private readonly Lazy<IProductService> _LazyProductService= new Lazy<IProductService>(()=>new ProductService(_unitOfWorke,_mapper)); 
        public IProductService productService => _LazyProductService.Value;
    }
}
