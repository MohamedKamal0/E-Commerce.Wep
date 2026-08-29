using DomainLayre.Contracts;
using DomainLayre.Models.IdentityModeyol;
using DomainLayre.Models.OrderModule;
using InfrastructureLayer.Data;
using InfrastructureLayer.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureLayer.DataSeed
{
    public class DataSeeding(AppDbContext _appdbContext, UserManager<ApplicationUser> _userManager,
        RoleManager<IdentityRole> _roleManager, StoreIdentityDbContext _dbContext) : IDataSeeding
    {
        public async Task IdentityDataSeedAsync()
        {
            try
            {
                if (_appdbContext.Database.GetPendingMigrations().Any())
                {
                    _appdbContext.Database.Migrate();
                }

                await SeedDeliveryMethodsAsync();

                if (!_roleManager.Roles.Any())
                {
                    await _roleManager.CreateAsync(new IdentityRole("Admin"));
                    await _roleManager.CreateAsync(new IdentityRole("SuperAdmin"));
                }
                if (!_userManager.Users.Any())
                {
                    var user1 = new ApplicationUser()
                    {
                        Email = "mohamedkama733@gmail.com",
                        DisplayName = "Mohamed Kamal",
                        UserName = "MK"
                    };
                    var user2 = new ApplicationUser()
                    {
                        Email = "medoka5.7.2003@gmail.com",
                        DisplayName = "Mo",
                        UserName = "MoKamal"
                    };


                    await _userManager.CreateAsync(user1, "String123&");
                    await _userManager.CreateAsync(user2, "String123&");
                    await _userManager.AddToRoleAsync(user1, "Admin");
                    await _userManager.AddToRoleAsync(user2, "SuperAdmin");

                }
                await _dbContext.SaveChangesAsync();

            }
            catch (Exception ex)
            {

            }

        }

        private async Task SeedDeliveryMethodsAsync()
        {
            if (await _appdbContext.Set<DeliveryMethod>().AnyAsync())
                return;

            await _appdbContext.Set<DeliveryMethod>().AddRangeAsync(
                new DeliveryMethod
                {
                    ShortName = "Standard",
                    Description = "Reliable delivery to your door",
                    DeliveryTime = "3-5 business days",
                    Price = 5.99m
                },
                new DeliveryMethod
                {
                    ShortName = "Express",
                    Description = "Priority handling and faster delivery",
                    DeliveryTime = "1-2 business days",
                    Price = 12.99m
                },
                new DeliveryMethod
                {
                    ShortName = "Economy",
                    Description = "Budget-friendly shipping option",
                    DeliveryTime = "5-7 business days",
                    Price = 2.99m
                }
            );

            await _appdbContext.SaveChangesAsync();
        }
    }
}
