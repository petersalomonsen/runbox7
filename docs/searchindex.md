Inspecting your search index
============================

The search index in Runbox 7 is a plain Xapian glass index (https://xapian.org/), which can
be inspected using regular Xapian tools like `xapian-delve` (link to tutorial below).

In order to inspect your search index locally you need to download the search index files.

Runbox 7 divides the search index into `partitions` for about every 50K messages in your account. If you have less than 50000 messages then there is only one partition.

You can get info about your partitions and index filenames from this URL (you need to be logged in):

https://runbox.com/rest/v1/searchindex/partitions

As you can see for each partition it says the name of the partition folder, and lists all the index file. So if you want to download `docdata.glass` from the `downloadable` partition folder,
then you'll get it from this URL:

https://runbox.com/rest/v1/searchindex/file/downloadable/docdata.glass

By downloading all the files for your index partition (`docdata.glass`, `iamglass`, `postlist.glass`, `termlist.glass`), you may inspect it with xapian-delve as described here:

https://getting-started-with-xapian.readthedocs.io/en/latest/practical_example/indexing/verifying_the_index.html

You may of course also use the xapian web assembly libraries bundled with the runbox 7 source,
and the corresponding javascript API's, either from nodejs or in the browser.

