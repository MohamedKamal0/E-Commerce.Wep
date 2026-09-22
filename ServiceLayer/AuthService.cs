using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using DomainLayre.Exceptions;
using DomainLayre.Models.IdentityModeyol;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ServiceLayerAbstraction;
using SheredLayer.DTOs.IdentityDTOs;

namespace ServiceLayer
{
    public class AuthService(UserManager<ApplicationUser> _userManager, IConfiguration _configuration, IMapper _mapper) : IAuthService
    {
        public async Task<bool> CheckEmailAsync(string email)
        {
            var User = await _userManager.FindByEmailAsync(email);
            return User is not null;
        }
        public async Task<UserDto> GetCurrentUserAsync(string email)
        {
            var User = await _userManager.FindByEmailAsync(email) ?? throw new UserNotFoundException(email);
            return new UserDto()
            { DisplayName = User.DisplayName, Email = User.Email, Token = await CreateTokenAsync(User) };
        }
        public async Task<IdentityAddressDto> GetCurrentUserAddressAsync(string email)
        {
            var User = await _userManager.Users.Include(u => u.Address).FirstOrDefaultAsync(x => x.Email == email)
                ?? throw new UserNotFoundException(email);
            if (User.Address is not null)
                return _mapper.Map<Address, IdentityAddressDto>(User.Address);
            else throw new AddressNotFoundException(email);
        }
        public async Task<IdentityAddressDto> UpdateCurrentUserAddress(string email, IdentityAddressDto addressDto)
        {

            var User = await _userManager.Users.Include(u => u.Address).FirstOrDefaultAsync(x => x.Email == email)
                ?? throw new UserNotFoundException(email);
            if (User.Address is not null)
            {
                User.Address.FristName = addressDto.FristName;
                User.Address.LastName = addressDto.LastName;
                User.Address.City = addressDto.City;
                User.Address.Country = addressDto.Country;
                User.Address.Street = addressDto.Street;
            }
            else
            {
                User.Address = _mapper.Map<IdentityAddressDto, Address>(addressDto);
            }
            await _userManager.UpdateAsync(User);
            return _mapper.Map<IdentityAddressDto>(User.Address);
        }


        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email) ?? throw new UserNotFoundException(loginDto.Email);
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (isPasswordValid)
            {
                return new UserDto()
                {
                    DisplayName = user.DisplayName,
                    Email = user.Email,
                    Token = await CreateTokenAsync(user)
                };

            }
            else throw new UnauthorizedException();
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            var User = new ApplicationUser
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                DisplayName = registerDto.DisplayName,
                PhoneNumber = registerDto.phoneNumber
            };
            var Result = await _userManager.CreateAsync(User, registerDto.Password);
            if (Result.Succeeded)
            {
                return new UserDto()
                {
                    DisplayName = User.DisplayName,
                    Email = User.Email,
                    Token = await CreateTokenAsync(User) // Placeholder for token generation login
                };
            }
            else
            {
                var errors = Result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException(errors);
            }
        }


        private async Task<string> CreateTokenAsync(ApplicationUser user)
        {
            var Claims = new List<Claim>()
            {
                new (ClaimTypes.Email,user.Email!),
                new (ClaimTypes.NameIdentifier,user.Id!),
                new (ClaimTypes.Name,user.UserName!),
            };
            var Roles = await _userManager.GetRolesAsync(user);
            foreach (var role in Roles)
                Claims.Add(new Claim(ClaimTypes.Role, role));

            var SecretKey = _configuration.GetSection("JWTOptions")["SecretKey"];
            var Key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            var Creds = new SigningCredentials(Key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                issuer: _configuration["JWTOptions:Issuer"],
                audience: _configuration["JWTOptions:Audience"],
                claims: Claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: Creds
                                           );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
    }
}