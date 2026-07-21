using AutoMapper;
using DomainLayre.Models.IdentityModeyol;
using SheredLayer.DTOs.IdentityDTOs;

namespace ServiceLayer.Mapping
{
    public class IdentityProfile : Profile
    {
        public IdentityProfile()
        {
            CreateMap<Address, IdentityAddressDto>().ReverseMap();
        }
    }
}
