<iframe class="MAWOembedIframe" id="maw-intermediate-iframe" src="https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVBBn1VAQGCgwOEBIWGBweICImKCosMDI2ODo8sgJCROoCZm5wdr4CfI4BkAHCApIBlgGYAZoB5gKiAcgCugKoAawBrgGwAbIBtAHOAroBvgHWAsABwgHKAsYByAHKAcwBzALQAdQB2AHaAegC1ALyAvAC5AHoAfgB%2BgHgAvwBigLGAowCjgKQAtgCmAKiAhgMRmFjZWJvb2tIb3N0GAN3ZWIYFVhDb21ldFBob3RvQ29udHJvbGxlcgA%3D.Aaqe1PMjj2mvJcsTaCIcizBfVpgh68Sg4FBO8r6i4bG1m5zb" style="display: none;"></iframe>

Once clicked on a video, this is how to get the url

Image like this
<img data-visualcompletion="media-vc-image" class="x15mokao x1ga7v0g x16uus16 xbiv7yw x1bwycvy x193iq5w x4fas0m x19kjcj4" alt="May be an image of lighting, pool, twilight and skyscraper" referrerpolicy="origin-when-cross-origin" src="https://scontent-blr1-1.xx.fbcdn.net/v/t39.30808-6/680014720_4250204441864377_3714461385395398298_n.jpg?stp=cp6_dst-jpg_tt6&amp;_nc_cat=109&amp;ccb=1-7&amp;_nc_sid=e06c5d&amp;_nc_ohc=35Ipscgfw1QQ7kNvwFMMD0D&amp;_nc_oc=AdpdY2Jjq8ygy5XtSQqPVqbK4-baaKdx7_CdCo9GvboblIougYxsRnikI2WauxgpAuA&amp;_nc_zt=23&amp;_nc_ht=scontent-blr1-1.xx&amp;_nc_gid=Kl4KWKtXolngQkeOFlXXpA&amp;_nc_ss=7b2a8&amp;oh=00_Af1bd7mm1vbgzpgTEwcMWDVrCIzTM89AZL3_LOHRkCUDwQ&amp;oe=69F30626">

This is when you click on the carousel and carousel opens in full screen

### Information We need

We need details like

> groupName
> authorName
> datePosted
> textDetails
> imagesLink (or images in folder)
> videoLink (or video in folder)

### How to locate posts by aria-posinset value

<div aria-posinset="1" class = "x1a2a7pz">
This represents a POST!
Presence of posinet can tell you  at which post you're  at right now!

But unfortunately the dom also represents posts out of the view i.e. non virtualizd content so it's important to develop a method of detecting empty posts and skipping it for the time being! We'll get em later!

### How to find profile name

Profile names can be found in a div with attribute
data-ad-rendering-role whose value should be equal to "profile_name"
so inside posinet, find div[data-ad-rendering-role="profile_name"]

There the image willbe > svg with aria-label
within svg there is a g tag. so svg[aria-label] > g > img with src leading to image

### How to locate show more

Inside this, check if role = button and text content is see more!

if it is, click on that button

### Find group name

document.querySelectorAll("h1").forEach(selector => console.log(selector.textContent))

The second one is group name
