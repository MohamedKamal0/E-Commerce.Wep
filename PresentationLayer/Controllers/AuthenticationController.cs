using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer.DTOs.IdentityDTOs;

namespace PresentationLayer.Controllers
{
    public class AuthenticationController(IServiceManger _serviceManger) : ApiBasController
    {

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto loginDto)
        {
            var result = await _serviceManger.authService.LoginAsync(loginDto);
            return Ok(result);
        }
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _serviceManger.authService.RegisterAsync(registerDto);
            return Ok(result);
        }
        [HttpGet("CheckEmail")]
        public async Task<ActionResult<bool>> CheckEmail(string email)
        {
            var Result = await _serviceManger.authService.CheckEmailAsync(email);
            return Ok(Result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("CurrentUsre")]
        public async Task<ActionResult<UserDto>> GetCurrentUsre()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);

            var AppUser = await _serviceManger.authService.GetCurrentUserAsync(email!);
            return Ok(AppUser);
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("CurrentUsreAddress")]
        public async Task<ActionResult<IdentityAddressDto>> GetCurrentUsreAddress()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);

            var address = await _serviceManger.authService.GetCurrentUserAddressAsync(email!);
            return Ok(address);
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("Addresss")]
        public async Task<ActionResult<IdentityAddressDto>> UpdateUsreAddress(IdentityAddressDto addressDto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);

            var updateaddress = await _serviceManger.authService.UpdateCurrentUserAddress(email!, addressDto);
            return Ok(updateaddress);
        }

    }
}
