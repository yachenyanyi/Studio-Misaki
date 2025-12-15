import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from blog.models import Post

def seed():
    if Post.objects.count() == 0:
        print("Seeding data...")
        for i in range(10):
            Post.objects.create(
                title=f"Modern Design Principles Part {i+1}",
                content=f"This is the content for article {i+1}. It talks about typography, spacing, and color theory in modern web design."
            )
        print("Done.")
    else:
        print("Data already exists.")

if __name__ == '__main__':
    seed()
