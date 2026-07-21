using SheredLayer.DTOs.IdentityDTOs;

namespace ServiceLayerAbstraction
{
    public interface IAuthService
    {
        Task<UserDto> LoginAsync(LoginDto loginDto);
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<bool> CheckEmailAsync(string email);
        Task<IdentityAddressDto> GetCurrentUserAddressAsync(string email);
        Task<IdentityAddressDto> UpdateCurrentUserAddress(string email, IdentityAddressDto addressDto);
        Task<UserDto> GetCurrentUserAsync(string email);
    }
}
