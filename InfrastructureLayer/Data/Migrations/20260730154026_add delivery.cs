using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfrastructureLayer.Data.Migrations
{
    /// <inheritdoc />
    public partial class adddelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliveryMethod_DliveryMethodId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeliveryMethod",
                table: "DeliveryMethod");

            migrationBuilder.RenameTable(
                name: "DeliveryMethod",
                newName: "DeliveryMethods");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeliveryMethods",
                table: "DeliveryMethods",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliveryMethods_DliveryMethodId",
                table: "Orders",
                column: "DliveryMethodId",
                principalTable: "DeliveryMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM DeliveryMethods)
BEGIN
    SET IDENTITY_INSERT DeliveryMethods ON;

    INSERT INTO DeliveryMethods (Id, ShortName, Description, DeliveryTime, Price)
    VALUES
        (1, 'Standard', 'Reliable delivery to your door', '3-5 business days', 5.99),
        (2, 'Express', 'Priority handling and faster delivery', '1-2 business days', 12.99),
        (3, 'Economy', 'Budget-friendly shipping option', '5-7 business days', 2.99);

    SET IDENTITY_INSERT DeliveryMethods OFF;
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliveryMethods_DliveryMethodId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeliveryMethods",
                table: "DeliveryMethods");

            migrationBuilder.RenameTable(
                name: "DeliveryMethods",
                newName: "DeliveryMethod");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeliveryMethod",
                table: "DeliveryMethod",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliveryMethod_DliveryMethodId",
                table: "Orders",
                column: "DliveryMethodId",
                principalTable: "DeliveryMethod",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
