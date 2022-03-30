def mount(aws_bucket_name):
    print(dbutils.fs.ls("/mnt/%s" % aws_bucket_name))

mount('bigbear-data-drop')
mount('bigbear-orbcomm')
mount('bigbear-lloyds')
