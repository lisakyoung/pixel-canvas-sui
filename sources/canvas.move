module pixel_canvas::canvas {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::string::String;
    use std::vector;
    use std::hash;
    use pixel_canvas::errors;
    use pixel_canvas::events;
    use pixel_canvas::factory::SeedPixel;
    
    const CANVAS_SIZE: u32 = 24;
    const TOTAL_PIXELS: u32 = 576;
    const COOLDOWN_MS: u64 = 10_000; // 10 seconds
    const MAX_CONTRIBUTION: u32 = 50;
    const AUCTION_DURATION: u64 = 86_400_000; // 24 hours
    
    struct Canvas has key {
        id: UID,
        title: String,
        proposer: address,
        colors: vector<u32>,        // Length 576
        filled: vector<u8>,          // Length 576, 1 if filled
        total_painted: u32,
        completed: bool,
        
        // Contribution tracking
        contrib: Table<address, u32>,
        last_paint_ms: Table<address, u64>,
        
        // Auction state
        auction_running: bool,
        auction_end_time: u64,
        highest_bid: u64,
        highest_bidder: address,
        escrow: Balance<SUI>,
        
        // Settlement
        settled: bool,
        sale_amount: u64,
        artwork_hash: vector<u8>,
        artwork_name: String,
        
        // Distribution
        proposer_claimed: bool,
        claimed: Table<address, u64>,
        vault: Balance<SUI>,
    }
    
    public(friend) fun create_with_seeds(
        title: String,
        seeds: vector<SeedPixel>,
        ctx: &mut TxContext
    ): ID {
        let proposer = tx_context::sender(ctx);
        let mut colors = vector::empty<u32>();
        let mut filled = vector::empty<u8>();
        
        // Initialize arrays
        let i = 0;
        while (i < TOTAL_PIXELS) {
            vector::push_back(&mut colors, 0);
            vector::push_back(&mut filled, 0);
            i = i + 1;
        };
        
        // Create canvas
        let mut canvas = Canvas {
            id: object::new(ctx),
            title,
            proposer,
            colors,
            filled,
            total_painted: 0,
            completed: false,
            contrib: table::new(ctx),
            last_paint_ms: table::new(ctx),
            auction_running: false,
            auction_end_time: 0,
            highest_bid: 0,
            highest_bidder: @0x0,
            escrow: balance::zero(),
            settled: false,
            sale_amount: 0,
            artwork_hash: vector::empty(),
            artwork_name: string::utf8(b""),
            proposer_claimed: false,
            claimed: table::new(ctx),
            vault: balance::zero(),
        };
        
        // Apply seed pixels
        let seed_count = vector::length(&seeds);
        let j = 0;
        while (j < seed_count) {
            let seed = vector::borrow(&seeds, j);
            let idx = seed.x + seed.y * 24;
            
            *vector::borrow_mut(&mut canvas.colors, (idx as u64)) = seed.color;
            *vector::borrow_mut(&mut canvas.filled, (idx as u64)) = 1;
            canvas.total_painted = canvas.total_painted + 1;
            
            // Emit painted event for each seed
            events::emit_painted(
                object::id(&canvas),
                proposer,
                seed.x,
                seed.y,
                seed.color,
                idx
            );
            
            j = j + 1;
        };
        
        // Update proposer contribution
        if (seed_count > 0) {
            table::add(&mut canvas.contrib, proposer, (seed_count as u32));
        };
        
        // Check if already complete (edge case)
        if (canvas.total_painted == TOTAL_PIXELS) {
            canvas.completed = true;
            canvas.auction_running = true;
            canvas.auction_end_time = 0; // Will be set on first bid
            events::emit_canvas_completed(
                object::id(&canvas),
                canvas.total_painted,
                table::length(&canvas.contrib)
            );
        };
        
        let canvas_id = object::id(&canvas);
        transfer::share_object(canvas);
        canvas_id
    }
    
    public entry fun paint_pixel(
        canvas: &mut Canvas,
        x: u32,
        y: u32,
        color: u32,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check not completed
        assert!(!canvas.completed, errors::canvas_completed());
        
        // Check bounds
        assert!(x < CANVAS_SIZE && y < CANVAS_SIZE, errors::pixel_out_of_bounds());
        
        let idx = x + y * CANVAS_SIZE;
        let painter = tx_context::sender(ctx);
        
        // Check not already painted
        assert!(*vector::borrow(&canvas.filled, (idx as u64)) == 0, errors::pixel_already_painted());
        
        // Check cooldown
        let now = clock::timestamp_ms(clock);
        if (table::contains(&canvas.last_paint_ms, painter)) {
            let last = *table::borrow(&canvas.last_paint_ms, painter);
            assert!(now >= last + COOLDOWN_MS, errors::cooldown_active());
            *table::borrow_mut(&mut canvas.last_paint_ms, painter) = now;
        } else {
            table::add(&mut canvas.last_paint_ms, painter, now);
        };
        
        // Check contribution limit
        let current_contrib = if (table::contains(&canvas.contrib, painter)) {
            *table::borrow(&canvas.contrib, painter)
        } else {
            0
        };
        assert!(current_contrib < MAX_CONTRIBUTION, errors::contribution_limit_exceeded());
        
        // Paint pixel
        *vector::borrow_mut(&mut canvas.colors, (idx as u64)) = color;
        *vector::borrow_mut(&mut canvas.filled, (idx as u64)) = 1;
        canvas.total_painted = canvas.total_painted + 1;
        
        // Update contribution
        if (table::contains(&mut canvas.contrib, painter)) {
            let contrib = table::borrow_mut(&mut canvas.contrib, painter);
            *contrib = *contrib + 1;
        } else {
            table::add(&mut canvas.contrib, painter, 1);
        };
        
        events::emit_painted(
            object::id(canvas),
            painter,
            x,
            y,
            color,
            idx
        );
        
        // Check completion
        if (canvas.total_painted == TOTAL_PIXELS) {
            canvas.completed = true;
            canvas.auction_running = true;
            canvas.auction_end_time = now + AUCTION_DURATION;
            
            events::emit_canvas_completed(
                object::id(canvas),
                canvas.total_painted,
                table::length(&canvas.contrib)
            );
            
            events::emit_auction_started(
                object::id(canvas),
                now,
                canvas.auction_end_time
            );
        }
    }
    
    // Getters for friend modules
    public(friend) fun get_colors(canvas: &Canvas): &vector<u32> {
        &canvas.colors
    }
    
    public(friend) fun is_settled(canvas: &Canvas): bool {
        canvas.settled
    }
    
    public(friend) fun get_proposer(canvas: &Canvas): address {
        canvas.proposer
    }
}