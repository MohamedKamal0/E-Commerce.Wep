using System.ComponentModel.DataAnnotations;

namespace SheredLayer.DTOs.IdentityDTOs
{
    public class RegisterDto
    {

        [EmailAddress]
        public string Email { get; set; } = default!;

        public string Password { get; set; } = default!;

        public string UserName { get; set; } = default!;
        public string DisplayName { get; set; } = default!;

        [Phone]
        public string phoneNumber { get; set; } = default!;
    }
}
