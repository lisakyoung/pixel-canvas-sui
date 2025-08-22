module pixel_canvas::events {
    use sui::event;
    use std::string::String;
    
    struct CanvasCreated has copy, drop {
        canvas_id: ID,
        proposer: address,
        title: String,
        seed_count: u32,
    }
    
    struct Painted has copy, drop {
        canvas_id: ID,
        painter: address,
        x: u32,
        y: u32,
        color: u32,
        index: u32,
    }
    
    struct CanvasCompleted has copy, drop {
        canvas_id: ID,
        total_painted: u32,
        contributors: u32,
    }
    
    struct AuctionStarted has copy, drop {
        canvas_id: ID,
        start_time: u64,
        end_time: u64,
    }
    
    struct BidPlaced has copy, drop {
        canvas_id: ID,
        bidder: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct AuctionSettled has copy, drop {
        canvas_id: ID,
        winner: address,
        sale_amount: u64,
        nft_id: ID,
    }
    
    struct ProposerClaimed has copy, drop {
        canvas_id: ID,
        proposer: address,
        amount: u64,
    }
    
    struct ParticipantClaimed has copy, drop {
        canvas_id: ID,
        participant: address,
        amount: u64,
    }
    
    public fun emit_canvas_created(canvas_id: ID, proposer: address, title: String, seed_count: u32) {
        event::emit(CanvasCreated { canvas_id, proposer, title, seed_count });
    }
    
    public fun emit_painted(canvas_id: ID, painter: address, x: u32, y: u32, color: u32, index: u32) {
        event::emit(Painted { canvas_id, painter, x, y, color, index });
    }
    
    public fun emit_canvas_completed(canvas_id: ID, total_painted: u32, contributors: u32) {
        event::emit(CanvasCompleted { canvas_id, total_painted, contributors });
    }
    
    public fun emit_auction_started(canvas_id: ID, start_time: u64, end_time: u64) {
        event::emit(AuctionStarted { canvas_id, start_time, end_time });
    }
    
    public fun emit_bid_placed(canvas_id: ID, bidder: address, amount: u64, timestamp: u64) {
        event::emit(BidPlaced { canvas_id, bidder, amount, timestamp });
    }
    
    public fun emit_auction_settled(canvas_id: ID, winner: address, sale_amount: u64, nft_id: ID) {
        event::emit(AuctionSettled { canvas_id, winner, sale_amount, nft_id });
    }
    
    public fun emit_proposer_claimed(canvas_id: ID, proposer: address, amount: u64) {
        event::emit(ProposerClaimed { canvas_id, proposer, amount });
    }
    
    public fun emit_participant_claimed(canvas_id: ID, participant: address, amount: u64) {
        event::emit(ParticipantClaimed { canvas_id, participant, amount });
    }
}