using Microsoft.AspNetCore.Identity;

namespace DomainLayre.Models.IdentityModeyol
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; } = default!;
        public Address? Address { get; set; }
    }
}
