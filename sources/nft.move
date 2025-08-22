module pixel_canvas::nft {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use std::string::String;
    use sui::url::{Self, Url};
    
    struct PixelCanvasNFT has key, store {
        id: UID,
        canvas_id: ID,
        title: String,
        artwork_hash: vector<u8>,
        total_pixels: u32,
        contributors: u64,
        image_url: Url,
    }
    
    public(friend) fun mint_canvas_nft(
        canvas_id: ID,
        title: String,
        artwork_hash: vector<u8>,
        total_pixels: u32,
        contributors: u64,
        recipient: address,
        ctx: &mut TxContext
    ): ID {
        let nft = PixelCanvasNFT {
            id: object::new(ctx),
            canvas_id,
            title,
            artwork_hash,
            total_pixels,
            contributors,
            image_url: url::new_unsafe_from_bytes(b"https://pixel-canvas.sui/api/image/"), // TODO: Add canvas_id
        };
        
        let nft_id = object::id(&nft);
        transfer::public_transfer(nft, recipient);
        nft_id
    }
}