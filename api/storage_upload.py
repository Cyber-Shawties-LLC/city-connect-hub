import os
import json
import logging
from azure.storage.blob import BlobServiceClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for uploading files to Azure Blob Storage.
    """
    try:
        # Get filename from params or body
        filename = req.params.get("filename")
        body_data = req.get_json() or {}
        if not filename:
            filename = body_data.get("filename")
        
        if not filename:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Filename is required"})
            }, 400
        
        # Get file content from body
        file_content = req.get_body()
        if not file_content:
            file_content = body_data.get("content") or body_data.get("data")
            if isinstance(file_content, str):
                file_content = file_content.encode()
        
        if not file_content:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "File content is required"})
            }, 400
        
        conn_string = os.environ.get("AZURE_STORAGE_CONN_STRING")
        if not conn_string:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Azure Storage connection string not configured"})
            }, 500
        
        blob_service = BlobServiceClient.from_connection_string(conn_string)
        container_name = os.environ.get("AZURE_STORAGE_CONTAINER", "uploads")
        
        container = blob_service.get_container_client(container_name)
        blob = container.get_blob_client(filename)
        
        blob.upload_blob(file_content, overwrite=True)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "status": "uploaded",
                "filename": filename,
                "container": container_name
            })
        }, 200
        
    except Exception as e:
        logger.error(f"Storage upload error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }, 500
