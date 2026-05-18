using DomainLayre.Models;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureLayer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }



        public DbSet<Product> Products { get; set; }
        public DbSet<Product_Brand> ProductBrands { get; set; }
        public DbSet<Product_Type> product_Types { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        }

    }
}
