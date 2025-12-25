#!/usr/bin/env python3
"""
FTP deployment script for uploading dist folder to production server
"""
import ftplib
import os
import sys
from pathlib import Path

def upload_directory(ftp, local_dir, remote_dir):
    """
    Recursively upload a directory to FTP server
    """
    try:
        # Try to change to remote directory, create if it doesn't exist
        try:
            ftp.cwd(remote_dir)
        except ftplib.error_perm:
            # Directory doesn't exist, create it
            print(f"Creating directory: {remote_dir}")
            ftp.mkd(remote_dir)
            ftp.cwd(remote_dir)
        
        # Get current working directory
        current_remote = ftp.pwd()
        print(f"Current remote directory: {current_remote}")
        
        # Upload files
        for item in os.listdir(local_dir):
            local_path = os.path.join(local_dir, item)
            
            if os.path.isfile(local_path):
                # Upload file
                print(f"Uploading: {item}")
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f'STOR {item}', f)
            elif os.path.isdir(local_path):
                # Recursively upload subdirectory
                print(f"Entering directory: {item}")
                remote_subdir = f"{current_remote}/{item}"
                upload_directory(ftp, local_path, remote_subdir)
                ftp.cwd(current_remote)  # Go back to parent directory
                
    except Exception as e:
        print(f"Error in upload_directory: {e}")
        raise

def main():
    # FTP credentials - CORRECTED
    FTP_HOST = "ftp.eeee.mu"
    FTP_USER = "u384688932.davidnew"
    FTP_PASS = "poupS123*"
    FTP_REMOTE_DIR = "/public_html"
    
    # Local directory to upload
    local_dist = "/workspace/fresh-dashboard/dist"
    
    if not os.path.exists(local_dist):
        print(f"Error: {local_dist} does not exist!")
        print("Please run 'pnpm run build' first.")
        sys.exit(1)
    
    print("=" * 60)
    print("FTP Deployment Script")
    print("=" * 60)
    print(f"Host: {FTP_HOST}")
    print(f"User: {FTP_USER}")
    print(f"Remote Directory: {FTP_REMOTE_DIR}")
    print(f"Local Directory: {local_dist}")
    print("=" * 60)
    
    try:
        # Connect to FTP server
        print("\n[1/4] Connecting to FTP server...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print(f"✓ Connected successfully!")
        print(f"Server: {ftp.getwelcome()}")
        
        # Change to remote directory
        print(f"\n[2/4] Changing to remote directory: {FTP_REMOTE_DIR}")
        ftp.cwd(FTP_REMOTE_DIR)
        print(f"✓ Current directory: {ftp.pwd()}")
        
        # Upload files
        print(f"\n[3/4] Uploading files from {local_dist}...")
        upload_directory(ftp, local_dist, FTP_REMOTE_DIR)
        
        # Close connection
        print("\n[4/4] Closing connection...")
        ftp.quit()
        print("✓ Connection closed")
        
        print("\n" + "=" * 60)
        print("✅ DEPLOYMENT SUCCESSFUL!")
        print("=" * 60)
        print(f"Your application is now live at: https://app.eeee.mu")
        print("\nNext steps:")
        print("1. Visit https://app.eeee.mu to verify deployment")
        print("2. Test the Purchase Orders page at /purchase-orders")
        print("3. Run the SQL script in Supabase to create database tables")
        print("4. Test all features with real data")
        print("=" * 60)
        
    except ftplib.error_perm as e:
        print(f"\n❌ FTP Permission Error: {e}")
        print("Please check your credentials and permissions.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Deployment Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()