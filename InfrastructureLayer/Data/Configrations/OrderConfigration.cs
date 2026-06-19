using DomainLayre.Models.OrderModule;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfrastructureLayer.Data.Configrations
{
    public class OrderConfigratio : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");
            builder.Property(o => o.Subtotal)
                .HasColumnType("decimal(8,2)");

            builder.HasMany(o => o.Items)
                .WithOne();

            builder.HasOne(o => o.DeliveryMethod)
                .WithMany().HasForeignKey(o => o.DliveryMethodId);
            builder.OwnsOne(o => o.Address);
        }
    }
}
