using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public abstract class ApiBasController : ControllerBase
    {
        protected string GetEmailFromToke() => User.FindFirstValue(ClaimTypes.Email);
    }
}
