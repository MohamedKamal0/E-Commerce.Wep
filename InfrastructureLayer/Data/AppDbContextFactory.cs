using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InfrastructureLayer.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(
               "Host=localhost;Port=5432;Database=EcommerceDb;Username=postgres;Password=123");
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
