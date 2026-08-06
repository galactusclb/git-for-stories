data "aws_region" "current" {}

locals {
    subnets_with_az = merge([
        for tier, cidrs in var.subnets : {
            for i, cidr in cidrs : "${tier}-${var.availability_zones[i]}" => {
                tier = tier
                cidr = cidr
                az = var.availability_zones[i]
            }
        }
    ]...)

    nat_gateway_public_route = keys({
      for k, v in local.subnets_with_az : k => v if v.tier == "public"
    })[0]
}

resource "aws_vpc" "this" {
    cidr_block = var.vpc_cidr

    enable_dns_support = true
    enable_dns_hostnames = true

    tags = {
        Name="LaunchZap-vpc"
    }
}

resource "aws_subnet" "this" {
    for_each = local.subnets_with_az

    vpc_id = aws_vpc.this.id
    cidr_block = each.value.cidr
    availability_zone = each.value.az

    tags = {
        Name = "${each.value.tier} Subnet ${each.key}"
    }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "igw"
  }
}

resource "aws_eip" "this" {
  domain = "vpc"

  tags = {
    "Name" = "eip"
  }

  depends_on = [ aws_internet_gateway.this ]
}

resource "aws_nat_gateway" "this" {
  subnet_id = aws_subnet.this[local.nat_gateway_public_route].id
  allocation_id = aws_eip.this.id

  tags = {
    Name= "Nat-GW"
  }

  depends_on = [ aws_eip.this ]
}

resource "aws_route_table" "this" {
  for_each = var.subnets

  vpc_id = aws_vpc.this.id
  
  tags = {
    Name = "${each.key}-rt"
  }
}

resource "aws_route_table_association" "this" {
  for_each = local.subnets_with_az

  subnet_id = aws_subnet.this[each.key].id
  route_table_id = aws_route_table.this[each.value.tier].id
}

resource "aws_route" "public-rt-igw" {
  route_table_id = aws_route_table.this["public"].id
  gateway_id = aws_internet_gateway.this.id
  destination_cidr_block = "0.0.0.0/0"
}

resource "aws_route" "private_data_rt_to_nat" {
  route_table_id         = aws_route_table.this["private-data"].id
  nat_gateway_id         = aws_nat_gateway.this.id
  destination_cidr_block = "0.0.0.0/0"
}

resource "aws_route" "private_compute_rt_to_nat" {
  route_table_id         = aws_route_table.this["private-compute"].id
  nat_gateway_id         = aws_nat_gateway.this.id
  destination_cidr_block = "0.0.0.0/0"
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id = aws_vpc.this.id
  service_name = "com.amazonaws.${data.aws_region.current.region}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [
    aws_route_table.this["private-compute"].id,
    aws_route_table.this["private-data"].id
  ]

  tags = { Name = "${var.vpc_name}-s3-endpoint" }
}