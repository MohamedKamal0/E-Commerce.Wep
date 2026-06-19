using DomainLayre.Models.OrderModule;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfrastructureLayer.Data.Configrations
{
    public class OrderItemConfigration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {

            builder.ToTable("OrderItems");

            builder.Property(oi => oi.Price)
                .HasColumnType("decimal(8,2)");

            builder.OwnsOne(oi => oi.Product);
        }
    }
}
