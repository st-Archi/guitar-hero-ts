#!/usr/bin/env python3
import boto3
import json
import datetime

REGION = "us-east-1"

ec2 = boto3.client("ec2", region_name=REGION)
s3  = boto3.client("s3",  region_name=REGION)

def listar_instancias():
    response = ec2.describe_instances()
    print("\n=== Instancias EC2 ===")
    for r in response["Reservations"]:
        for i in r["Instances"]:
            print(f"  ID: {i['InstanceId']} | Tipo: {i['InstanceType']} | Estado: {i['State']['Name']}")

def listar_buckets():
    response = s3.list_buckets()
    print("\n=== Buckets S3 ===")
    for b in response["Buckets"]:
        print(f"  {b['Name']}")

def generar_reporte():
    now = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%d %H:%M:%S")
    instancias = ec2.describe_instances()["Reservations"]
    buckets = s3.list_buckets()["Buckets"]
    reporte = {
        "fecha": now,
        "total_instancias": sum(len(r["Instances"]) for r in instancias),
        "total_buckets": len(buckets)
    }
    print("\n=== Reporte ===")
    print(json.dumps(reporte, indent=2))

listar_instancias()
listar_buckets()
generar_reporte()
