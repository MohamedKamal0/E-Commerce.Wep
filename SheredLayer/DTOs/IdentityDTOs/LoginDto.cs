using System.ComponentModel.DataAnnotations;

namespace SheredLayer.DTOs.IdentityDTOs
{
    public class LoginDto
    {
        [EmailAddress]
        public string Email { get; set; } = default!;

        public string Password { get; set; } = default!;
    }
}
