using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FastestTyper.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeMsToEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TimeMs",
                table: "Entries",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeMs",
                table: "Entries");
        }
    }
}
