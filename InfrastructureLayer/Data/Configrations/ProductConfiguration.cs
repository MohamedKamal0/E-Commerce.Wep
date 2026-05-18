using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomainLayre.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfrastructureLayer.Data.Configrations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.HasOne(p => p.Product_Brand)
                .WithMany()
                .HasForeignKey(p => p.BrandId);

            builder.HasOne(p => p.Product_Type)
                .WithMany()
                .HasForeignKey(p => p.TyepId);

            builder.Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

        }
    }
}
