module pixel_canvas::auction {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::balance;
    use pixel_canvas::canvas::{Self, Canvas};
    use pixel_canvas::errors;
    use pixel_canvas::events;
    use pixel_canvas::nft;
    
    public entry fun place_bid(
        canvas: &mut Canvas,
        clock: &Clock,
        bid: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(canvas.auction_running, errors::auction_not_started());
        
        let now = clock::timestamp_ms(clock);
        assert!(now < canvas.auction_end_time, errors::auction_ended());
        
        let bid_amount = coin::value(&bid);
        let min_bid = calculate_min_bid(canvas.highest_bid);
        assert!(bid_amount >= min_bid, errors::bid_too_low());
        
        // Refund previous bidder
        if (canvas.highest_bidder != @0x0) {
            let refund = coin::from_balance(
                balance::split(&mut canvas.escrow, canvas.highest_bid),
                ctx
            );
            transfer::public_transfer(refund, canvas.highest_bidder);
        };
        
        // Update auction state
        canvas.highest_bid = bid_amount;
        canvas.highest_bidder = tx_context::sender(ctx);
        balance::join(&mut canvas.escrow, coin::into_balance(bid));
        
        events::emit_bid_placed(
            object::id(canvas),
            canvas.highest_bidder,
            bid_amount,
            now
        );
    }
    
    public entry fun settle_auction(
        canvas: &mut Canvas,
        clock: &Clock,
        name: String,
        ctx: &mut TxContext
    ) {
        assert!(canvas.auction_running, errors::auction_not_started());
        assert!(!canvas.settled, errors::auction_already_settled());
        
        let now = clock::timestamp_ms(clock);
        assert!(now >= canvas.auction_end_time, errors::auction_not_ended());
        
        canvas.settled = true;
        canvas.artwork_name = name;
        
        // Compute hash from colors
        let colors = canvas::get_colors(canvas);
        canvas.artwork_hash = hash::sha3_256(*colors);
        
        // Determine winner and mint NFT
        let winner = if (canvas.highest_bidder != @0x0) {
            canvas.sale_amount = canvas.highest_bid;
            balance::join(&mut canvas.vault, balance::split(&mut canvas.escrow, canvas.highest_bid));
            canvas.highest_bidder
        } else {
            canvas.sale_amount = 0;
            canvas::get_proposer(canvas)
        };
        
        // Mint NFT to winner
        let nft_id = nft::mint_canvas_nft(
            object::id(canvas),
            canvas.title,
            canvas.artwork_hash,
            canvas.total_painted,
            table::length(&canvas.contrib),
            winner,
            ctx
        );
        
        events::emit_auction_settled(
            object::id(canvas),
            winner,
            canvas.sale_amount,
            nft_id
        );
    }
    
    fun calculate_min_bid(current: u64): u64 {
        if (current == 0) {
            100_000_000 // 0.1 SUI start
        } else if (current <= 10_000_000_000) { // ≤ 10 SUI
            current + 100_000_000 // +0.1 SUI
        } else if (current <= 100_000_000_000) { // ≤ 100 SUI
            current + 1_000_000_000 // +1 SUI
        } else if (current <= 1000_000_000_000) { // ≤ 1000 SUI
            current + 5_000_000_000 // +5 SUI
        } else {
            current + 10_000_000_000 // +10 SUI
        }
    }
}