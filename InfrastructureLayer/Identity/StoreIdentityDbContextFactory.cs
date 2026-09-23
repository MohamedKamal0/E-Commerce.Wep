using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InfrastructureLayer.Identity
{
    public class StoreIdentityDbContextFactory
        : IDesignTimeDbContextFactory<StoreIdentityDbContext>
    {
        public StoreIdentityDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder =
                new DbContextOptionsBuilder<StoreIdentityDbContext>();

            optionsBuilder.UseNpgsql(
                "Host=localhost;Port=5432;Database=EcommerceIdentityDb;Username=postgres;Password=123");

            return new StoreIdentityDbContext(optionsBuilder.Options);
        }
    }
}